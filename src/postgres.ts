import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.PG_USER,
    host: 'localhost',
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT),
});

export const query = async (text: string, params?: any[]) => {
    try {
        const res = await pool.query(text, params);
        if (text.toUpperCase().startsWith("SELECT")) return res.rows;
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    };
};

(async () => {
    await query(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created TIMESTAMP DEFAULT NOW(),
        deleteacc TIMESTAMP,
        prefix TEXT,
        lang TEXT,
        referred_by TEXT,
        premium INT DEFAULT 0 NOT NULL,
        premium_expires TIMESTAMP,
        xp INT DEFAULT 0 NOT NULL,
        fav_char BIGINT,
        coins INT DEFAULT 0 NOT NULL,
        gems INT DEFAULT 0 NOT NULL,
        jades INT DEFAULT 0 NOT NULL,
        lastonline TIMESTAMP DEFAULT NOW(),
        lastvote TIMESTAMP,
        lastweekly TIMESTAMP,
        lastdaily TIMESTAMP,
        dailystreak INT DEFAULT 0 NOT NULL,
        lastrush TIMESTAMP,
        rushclaimed INT DEFAULT 0 NOT NULL,
        draws INT DEFAULT 0 NOT NULL,
        drawstotal INT DEFAULT 0 NOT NULL,
        claims INT DEFAULT 0 NOT NULL,
        claimstotal INT DEFAULT 0 NOT NULL,
        drawresets INT DEFAULT 0 NOT NULL,
        votestotal INT DEFAULT 0 NOT NULL,
        votereminder BOOLEAN DEFAULT FALSE NOT NULL,
        transactions JSONB DEFAULT '[]' NOT NULL
    )`);
    await query(`CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        user_ids TEXT[] NOT NULL,
        prefix TEXT,
        drop_channel TEXT,
        allow_global_drops BOOLEAN DEFAULT FALSE NOT NULL,
        premium INT DEFAULT 0 NOT NULL,
        premium_expires TIMESTAMP
    )`);
    await query(`CREATE TABLE IF NOT EXISTS anime (
        id INT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        aliases TEXT[] DEFAULT '{}' NOT NULL
    )`);
    await query(`CREATE TABLE IF NOT EXISTS characters (
        id INT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        anime_id INT NOT NULL,
        aliases TEXT[] DEFAULT '{}' NOT NULL,
        image_url TEXT NOT NULL UNIQUE,
        rarity INT NOT NULL,
        gender TEXT NOT NULL,
        FOREIGN KEY (anime_id) REFERENCES anime(id)
    )`);
    await query(`CREATE TABLE IF NOT EXISTS inventory (
        rowid BIGSERIAL PRIMARY KEY NOT NULL,
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        char_id INT NOT NULL,
        rarity INT NOT NULL,
        alias TEXT,
        custom_image_url TEXT,
        claimed TIMESTAMP DEFAULT NOW(),
        claimed_by TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (char_id) REFERENCES characters(id) ON DELETE CASCADE,
        CONSTRAINT unique_id_char_id UNIQUE (id, char_id)
    )`);
    await query(`CREATE TABLE IF NOT EXISTS bans (
        id TEXT PRIMARY KEY NOT NULL,
        banned_by TEXT NOT NULL,
        reason TEXT,
        expires TIMESTAMP,
        created TIMESTAMP DEFAULT NOW()
    )`);

})();



// Create Triggers
(async () => {

    // Remove user id from servers
    await query(`
        CREATE OR REPLACE FUNCTION remove_user_id_from_servers() RETURNS TRIGGER AS $$
        BEGIN
            UPDATE servers SET user_ids = array_remove(user_ids, OLD.id);
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    `, []);
    await query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'remove_user_id_after_delete') THEN
                CREATE TRIGGER remove_user_id_after_delete
                AFTER DELETE ON users
                FOR EACH ROW EXECUTE PROCEDURE remove_user_id_from_servers();
            END IF;
        END $$;
    `, []);


    // Anime name and aliases uniqueness
    await query(`
        CREATE OR REPLACE FUNCTION check_anime_name_aliases_uniqueness() 
        RETURNS TRIGGER AS $$
        DECLARE
            -- Variables to hold count of conflicts
            name_conflict_count INT;
            alias_conflict_count INT;
        BEGIN
            -- Check for name conflicts with other names
            SELECT COUNT(*) INTO name_conflict_count 
            FROM anime
            WHERE name = NEW.name;

            IF name_conflict_count > 0 THEN
                RAISE EXCEPTION 'Name conflicts with an existing name in the table';
            END IF;

            -- Check for alias conflicts with other names and aliases
            SELECT COUNT(*) INTO alias_conflict_count 
            FROM (
                SELECT unnest(NEW.aliases) AS alias
            ) AS new_aliases
            JOIN (
                SELECT name AS existing_alias FROM anime
                UNION ALL
                SELECT unnest(aliases) AS existing_alias FROM anime
            ) AS all_existing_aliases
            ON new_aliases.alias = all_existing_aliases.existing_alias;

            IF alias_conflict_count > 0 THEN
                RAISE EXCEPTION 'Alias conflicts with an existing name or alias in the table';
            END IF;

            -- Ensure no duplicates within the alias array itself
            IF array_length(NEW.aliases, 1) > array_length(ARRAY(SELECT DISTINCT unnest(NEW.aliases)), 1) THEN
                RAISE EXCEPTION 'Alias array contains duplicate entries';
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `, []);
    await query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'check_anime_name_aliases_uniqueness_trigger') THEN
                CREATE TRIGGER check_anime_name_aliases_uniqueness_trigger
                BEFORE INSERT OR UPDATE ON anime
                FOR EACH ROW EXECUTE PROCEDURE check_anime_name_aliases_uniqueness();
            END IF;
        END $$;
    `, []);


    // Character name and aliases uniqueness
    await query(`
        CREATE OR REPLACE FUNCTION check_character_name_aliases_uniqueness() 
        RETURNS TRIGGER AS $$
        DECLARE
            -- Variables to hold count of conflicts
            name_conflict_count INT;
            alias_conflict_count INT;
        BEGIN
            -- Check for name conflicts with other names
            SELECT COUNT(*) INTO name_conflict_count 
            FROM characters
            WHERE name = NEW.name;

            IF name_conflict_count > 0 THEN
                RAISE EXCEPTION 'Name conflicts with an existing name in the table';
            END IF;

            -- Check for alias conflicts with other names and aliases
            SELECT COUNT(*) INTO alias_conflict_count 
            FROM (
                SELECT unnest(NEW.aliases) AS alias
            ) AS new_aliases
            JOIN (
                SELECT name AS existing_alias FROM characters
                UNION ALL
                SELECT unnest(aliases) AS existing_alias FROM characters
            ) AS all_existing_aliases
            ON new_aliases.alias = all_existing_aliases.existing_alias;

            IF alias_conflict_count > 0 THEN
                RAISE EXCEPTION 'Alias conflicts with an existing name or alias in the table';
            END IF;

            -- Ensure no duplicates within the alias array itself
            IF array_length(NEW.aliases, 1) > array_length(ARRAY(SELECT DISTINCT unnest(NEW.aliases)), 1) THEN
                RAISE EXCEPTION 'Alias array contains duplicate entries';
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `, []);
    await query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'check_character_name_aliases_uniqueness_trigger') THEN
                CREATE TRIGGER check_character_name_aliases_uniqueness_trigger
                BEFORE INSERT OR UPDATE ON characters
                FOR EACH ROW EXECUTE PROCEDURE check_character_name_aliases_uniqueness();
            END IF;
        END $$;
    `, []);

    // Auto Update Character IDS
    await query(`
        -- Create a function to convert an integer to a Base64 string
        CREATE OR REPLACE FUNCTION int_to_base64(val INT)
        RETURNS TEXT AS $$
        DECLARE
            base64_chars TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
            result TEXT := '';
            remainder INT;
        BEGIN
            IF val = 0 THEN
                RETURN SUBSTRING(base64_chars FROM 1 FOR 1);
            END IF;

            WHILE val > 0 LOOP
                remainder := (val % 64) + 1;
                result := SUBSTRING(base64_chars FROM remainder FOR 1) || result;
                val := val / 64;
            END LOOP;

            RETURN result;
        END;
        $$ LANGUAGE plpgsql;


        -- Create a function to convert a Base64 string to an integer
        CREATE OR REPLACE FUNCTION base64_to_int(base64_str TEXT)
        RETURNS INT AS $$
        DECLARE
            base64_chars TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
            result INT := 0;
            i INT;
            char TEXT;
            char_index INT;
        BEGIN
            FOR i IN 1..LENGTH(base64_str) LOOP
                char := SUBSTRING(base64_str FROM i FOR 1);
                char_index := POSITION(char IN base64_chars) - 1;
                result := result * 64 + char_index;
            END LOOP;

            RETURN result;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger function to automatically set Base64 id value
        CREATE OR REPLACE FUNCTION set_inventory_id_value()
        RETURNS TRIGGER AS $$
        DECLARE
            next_id INT;
            next_id_base64 TEXT;
        BEGIN
            -- Find the smallest missing id value for the given char_id
            SELECT MIN(base64_to_int(t1.id) + 1) 
            INTO next_id
            FROM inventory t1
            LEFT JOIN inventory t2 
            ON t1.char_id = t2.char_id 
            AND base64_to_int(t1.id) = base64_to_int(t2.id) - 1
            WHERE t1.char_id = NEW.char_id 
            AND t2.id IS NULL;

            -- If no missing id value found, set it to the max id + 1 for the given char_id
            IF next_id IS NULL THEN
                SELECT COALESCE(MAX(base64_to_int(id)), 0) + 1 INTO next_id FROM inventory WHERE char_id = NEW.char_id;
            END IF;

            -- Convert the next id value to Base64
            next_id_base64 := int_to_base64(next_id);

            -- Set the new id value
            NEW.id := next_id_base64;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `, []);
    await query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_inventory_id_value_trigger') THEN
                CREATE TRIGGER set_inventory_id_value_trigger
                BEFORE INSERT ON inventory
                FOR EACH ROW EXECUTE FUNCTION set_inventory_id_value();
            END IF;
        END $$;
    `, []);

})();

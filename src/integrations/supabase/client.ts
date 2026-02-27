import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://evynlsnrvtgbtcjonfxw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6cvRW5lK2qSlutsp9be4jw_QWofpZHl";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

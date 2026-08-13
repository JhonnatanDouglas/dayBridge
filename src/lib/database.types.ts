export type Database = {
  public: {
    Tables: {
      saved_holidays: {
        Row: {
          id: string;
          user_id: string;
          external_id: string;
          country_code: string;
          holiday_date: string;
          local_name: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          external_id: string;
          country_code: string;
          holiday_date: string;
          local_name: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          external_id?: string;
          country_code?: string;
          holiday_date?: string;
          local_name?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

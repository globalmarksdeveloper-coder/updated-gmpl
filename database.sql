--
-- PostgreSQL database dump
--

\restrict MgSGcHS4BnQhzm4CSGJExCHMHgxbP40OUb7sHzrsDAZp9krQJ1iW4pwQ3mL3kCn

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: am_tsc_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.am_tsc_assignments (
    id integer NOT NULL,
    am_employee_id integer NOT NULL,
    tsc_employee_id integer NOT NULL,
    city_id integer NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.am_tsc_assignments OWNER TO postgres;

--
-- Name: am_tsc_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.am_tsc_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.am_tsc_assignments_id_seq OWNER TO postgres;

--
-- Name: am_tsc_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.am_tsc_assignments_id_seq OWNED BY public.am_tsc_assignments.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    attendance_id integer NOT NULL,
    assignment_id integer,
    employee_id integer NOT NULL,
    store_id integer NOT NULL,
    shift_id integer NOT NULL,
    attendance_date date NOT NULL,
    check_in_time timestamp without time zone,
    check_out_time timestamp without time zone,
    check_in_latitude numeric(10,8),
    check_in_longitude numeric(11,8),
    check_out_latitude numeric(10,8),
    check_out_longitude numeric(11,8),
    status character varying(30) DEFAULT 'Present'::character varying,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    break_start_time timestamp without time zone,
    break_end_time timestamp without time zone
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_attendance_id_seq OWNED BY public.attendance.attendance_id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    brand_id integer NOT NULL,
    brand_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: brands_brand_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brands_brand_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brands_brand_id_seq OWNER TO postgres;

--
-- Name: brands_brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brands_brand_id_seq OWNED BY public.brands.brand_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    brand_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_category_id_seq OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    city_id integer NOT NULL,
    city_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cities OWNER TO postgres;

--
-- Name: cities_city_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cities ALTER COLUMN city_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cities_city_id_seq
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: city_am_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.city_am_assignments (
    id integer NOT NULL,
    city_id integer NOT NULL,
    am_employee_id integer NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.city_am_assignments OWNER TO postgres;

--
-- Name: city_am_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.city_am_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.city_am_assignments_id_seq OWNER TO postgres;

--
-- Name: city_am_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.city_am_assignments_id_seq OWNED BY public.city_am_assignments.id;


--
-- Name: employee_store_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_store_assignments (
    assignment_id integer NOT NULL,
    employee_id integer NOT NULL,
    store_id integer NOT NULL,
    shift_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tsc_employee_id integer
);


ALTER TABLE public.employee_store_assignments OWNER TO postgres;

--
-- Name: employee_store_assignments_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_store_assignments_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_store_assignments_assignment_id_seq OWNER TO postgres;

--
-- Name: employee_store_assignments_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_store_assignments_assignment_id_seq OWNED BY public.employee_store_assignments.assignment_id;


--
-- Name: gm_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gm_employees (
    employee_id integer NOT NULL,
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    phone character varying(20),
    status character varying(20) DEFAULT 'Active'::character varying,
    joining_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    employee_code character varying(20) GENERATED ALWAYS AS (('EMP-'::text || lpad((employee_id)::text, 4, '0'::text))) STORED,
    fixed_salary numeric(10,2) DEFAULT 0
);


ALTER TABLE public.gm_employees OWNER TO postgres;

--
-- Name: gm_employees_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gm_employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gm_employees_employee_id_seq OWNER TO postgres;

--
-- Name: gm_employees_employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gm_employees_employee_id_seq OWNED BY public.gm_employees.employee_id;


--
-- Name: gm_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gm_users (
    user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(150),
    password_hash character varying(255) NOT NULL,
    role_id integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_code character varying(20) GENERATED ALWAYS AS (('USR-'::text || lpad((user_id)::text, 4, '0'::text))) STORED,
    cnic character varying(15),
    father_name character varying(100),
    address text,
    bank_name character varying(100),
    bank_account character varying(30),
    iban character varying(34),
    phone character varying(15)
);


ALTER TABLE public.gm_users OWNER TO postgres;

--
-- Name: gm_users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gm_users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gm_users_user_id_seq OWNER TO postgres;

--
-- Name: gm_users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gm_users_user_id_seq OWNED BY public.gm_users.user_id;


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holidays (
    holiday_id integer NOT NULL,
    holiday_name character varying(150) NOT NULL,
    holiday_date date NOT NULL,
    city_id integer,
    is_national boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.holidays OWNER TO postgres;

--
-- Name: holidays_holiday_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.holidays_holiday_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.holidays_holiday_id_seq OWNER TO postgres;

--
-- Name: holidays_holiday_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.holidays_holiday_id_seq OWNED BY public.holidays.holiday_id;


--
-- Name: incentive_slabs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incentive_slabs (
    slab_id integer NOT NULL,
    slab_order integer NOT NULL,
    threshold_pct numeric(5,2) NOT NULL,
    incentive_pct numeric(5,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.incentive_slabs OWNER TO postgres;

--
-- Name: incentive_slabs_slab_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incentive_slabs_slab_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incentive_slabs_slab_id_seq OWNER TO postgres;

--
-- Name: incentive_slabs_slab_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incentive_slabs_slab_id_seq OWNED BY public.incentive_slabs.slab_id;


--
-- Name: leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaves (
    leave_id integer NOT NULL,
    employee_id integer NOT NULL,
    from_date date NOT NULL,
    to_date date NOT NULL,
    leave_type character varying(50) DEFAULT 'casual'::character varying NOT NULL,
    reason text,
    days_count integer DEFAULT 1 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    admin_note text,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT leaves_leave_type_check CHECK (((leave_type)::text = ANY ((ARRAY['casual'::character varying, 'sick'::character varying, 'annual'::character varying, 'emergency'::character varying, 'unpaid'::character varying])::text[]))),
    CONSTRAINT leaves_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.leaves OWNER TO postgres;

--
-- Name: leaves_leave_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leaves_leave_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leaves_leave_id_seq OWNER TO postgres;

--
-- Name: leaves_leave_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leaves_leave_id_seq OWNED BY public.leaves.leave_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: sales_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_entries (
    sales_entry_id integer NOT NULL,
    assignment_id integer,
    employee_id integer NOT NULL,
    store_id integer NOT NULL,
    sales_date date NOT NULL,
    remarks text,
    image_path text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales_entries OWNER TO postgres;

--
-- Name: sales_entries_sales_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_entries_sales_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_entries_sales_entry_id_seq OWNER TO postgres;

--
-- Name: sales_entries_sales_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_entries_sales_entry_id_seq OWNED BY public.sales_entries.sales_entry_id;


--
-- Name: sales_entry_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_entry_items (
    sales_item_id integer NOT NULL,
    sales_entry_id integer NOT NULL,
    sku_id integer NOT NULL,
    qty integer DEFAULT 0 NOT NULL,
    retail_price numeric(10,2) NOT NULL,
    total_amount numeric(12,2) GENERATED ALWAYS AS (((qty)::numeric * retail_price)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales_entry_items OWNER TO postgres;

--
-- Name: sales_entry_items_sales_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_entry_items_sales_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_entry_items_sales_item_id_seq OWNER TO postgres;

--
-- Name: sales_entry_items_sales_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_entry_items_sales_item_id_seq OWNED BY public.sales_entry_items.sales_item_id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    shift_id integer NOT NULL,
    shift_name character varying(50) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- Name: shifts_shift_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shifts_shift_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shifts_shift_id_seq OWNER TO postgres;

--
-- Name: shifts_shift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shifts_shift_id_seq OWNED BY public.shifts.shift_id;


--
-- Name: skus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skus (
    sku_id integer NOT NULL,
    category_id integer NOT NULL,
    sku_name character varying(150) NOT NULL,
    unit_of_measure character varying(50),
    retail_price numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    size character varying(50),
    wholesale_price numeric(10,2),
    lmt_price_ex_tax numeric(10,2),
    lmt_price_in_tax numeric(10,2),
    s_tax_rate numeric(5,2) DEFAULT 0,
    consumer_price numeric(10,2)
);


ALTER TABLE public.skus OWNER TO postgres;

--
-- Name: skus_sku_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skus_sku_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skus_sku_id_seq OWNER TO postgres;

--
-- Name: skus_sku_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skus_sku_id_seq OWNED BY public.skus.sku_id;


--
-- Name: store_monthly_targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_monthly_targets (
    target_id integer NOT NULL,
    store_id integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    target_amount numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT store_monthly_targets_month_check CHECK (((month >= 1) AND (month <= 12)))
);


ALTER TABLE public.store_monthly_targets OWNER TO postgres;

--
-- Name: store_monthly_targets_target_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_monthly_targets_target_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_monthly_targets_target_id_seq OWNER TO postgres;

--
-- Name: store_monthly_targets_target_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_monthly_targets_target_id_seq OWNED BY public.store_monthly_targets.target_id;


--
-- Name: store_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_pricing (
    pricing_id integer NOT NULL,
    store_id integer NOT NULL,
    sku_id integer NOT NULL,
    tse_price numeric(10,2),
    ba_price numeric(10,2),
    effective_from date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.store_pricing OWNER TO postgres;

--
-- Name: store_pricing_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_pricing_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_pricing_pricing_id_seq OWNER TO postgres;

--
-- Name: store_pricing_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_pricing_pricing_id_seq OWNED BY public.store_pricing.pricing_id;


--
-- Name: stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stores (
    store_id integer NOT NULL,
    store_name character varying(100) NOT NULL,
    city_id integer NOT NULL,
    address text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    allowed_radius_meters integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stores OWNER TO postgres;

--
-- Name: stores_store_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stores_store_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stores_store_id_seq OWNER TO postgres;

--
-- Name: stores_store_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stores_store_id_seq OWNED BY public.stores.store_id;


--
-- Name: tsc_store_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tsc_store_assignments (
    id integer NOT NULL,
    tsc_employee_id integer NOT NULL,
    store_id integer NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tsc_store_assignments OWNER TO postgres;

--
-- Name: tsc_store_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tsc_store_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tsc_store_assignments_id_seq OWNER TO postgres;

--
-- Name: tsc_store_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tsc_store_assignments_id_seq OWNED BY public.tsc_store_assignments.id;


--
-- Name: am_tsc_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.am_tsc_assignments ALTER COLUMN id SET DEFAULT nextval('public.am_tsc_assignments_id_seq'::regclass);


--
-- Name: attendance attendance_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN attendance_id SET DEFAULT nextval('public.attendance_attendance_id_seq'::regclass);


--
-- Name: brands brand_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands ALTER COLUMN brand_id SET DEFAULT nextval('public.brands_brand_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: city_am_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city_am_assignments ALTER COLUMN id SET DEFAULT nextval('public.city_am_assignments_id_seq'::regclass);


--
-- Name: employee_store_assignments assignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_store_assignments ALTER COLUMN assignment_id SET DEFAULT nextval('public.employee_store_assignments_assignment_id_seq'::regclass);


--
-- Name: gm_employees employee_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_employees ALTER COLUMN employee_id SET DEFAULT nextval('public.gm_employees_employee_id_seq'::regclass);


--
-- Name: gm_users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_users ALTER COLUMN user_id SET DEFAULT nextval('public.gm_users_user_id_seq'::regclass);


--
-- Name: holidays holiday_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays ALTER COLUMN holiday_id SET DEFAULT nextval('public.holidays_holiday_id_seq'::regclass);


--
-- Name: incentive_slabs slab_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incentive_slabs ALTER COLUMN slab_id SET DEFAULT nextval('public.incentive_slabs_slab_id_seq'::regclass);


--
-- Name: leaves leave_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves ALTER COLUMN leave_id SET DEFAULT nextval('public.leaves_leave_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: sales_entries sales_entry_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries ALTER COLUMN sales_entry_id SET DEFAULT nextval('public.sales_entries_sales_entry_id_seq'::regclass);


--
-- Name: sales_entry_items sales_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entry_items ALTER COLUMN sales_item_id SET DEFAULT nextval('public.sales_entry_items_sales_item_id_seq'::regclass);


--
-- Name: shifts shift_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts ALTER COLUMN shift_id SET DEFAULT nextval('public.shifts_shift_id_seq'::regclass);


--
-- Name: skus sku_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skus ALTER COLUMN sku_id SET DEFAULT nextval('public.skus_sku_id_seq'::regclass);


--
-- Name: store_monthly_targets target_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_monthly_targets ALTER COLUMN target_id SET DEFAULT nextval('public.store_monthly_targets_target_id_seq'::regclass);


--
-- Name: store_pricing pricing_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_pricing ALTER COLUMN pricing_id SET DEFAULT nextval('public.store_pricing_pricing_id_seq'::regclass);


--
-- Name: stores store_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores ALTER COLUMN store_id SET DEFAULT nextval('public.stores_store_id_seq'::regclass);


--
-- Name: tsc_store_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tsc_store_assignments ALTER COLUMN id SET DEFAULT nextval('public.tsc_store_assignments_id_seq'::regclass);


--
-- Data for Name: am_tsc_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.am_tsc_assignments (id, am_employee_id, tsc_employee_id, city_id, start_date, end_date, is_active, created_at) FROM stdin;
1	2	3	101	2025-11-02	\N	t	2026-05-02 10:41:08.515305
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (attendance_id, assignment_id, employee_id, store_id, shift_id, attendance_date, check_in_time, check_out_time, check_in_latitude, check_in_longitude, check_out_latitude, check_out_longitude, status, remarks, created_at, break_start_time, break_end_time) FROM stdin;
1	1	4	1	1	2026-05-01	2026-05-01 09:12:28.390183	2026-05-01 17:07:19.314526	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
2	1	4	1	1	2026-04-30	2026-04-30 09:08:52.675334	2026-04-30 17:25:51.3918	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
3	1	4	1	1	2026-04-28	2026-04-28 09:03:59.956647	2026-04-28 17:12:13.700062	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
4	1	4	1	1	2026-04-27	2026-04-27 09:08:24.746415	2026-04-27 17:06:26.857083	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
5	1	4	1	1	2026-04-25	2026-04-25 09:17:26.768904	2026-04-25 17:20:08.966041	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
6	1	4	1	1	2026-04-24	2026-04-24 09:11:22.582545	2026-04-24 17:10:19.775938	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
7	1	4	1	1	2026-04-23	2026-04-23 09:19:15.757719	2026-04-23 17:07:52.193933	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
8	1	4	1	1	2026-04-21	2026-04-21 09:02:10.323189	2026-04-21 17:28:31.272943	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
9	1	4	1	1	2026-04-20	2026-04-20 09:18:41.983062	2026-04-20 17:06:01.197925	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
10	1	4	1	1	2026-04-18	2026-04-18 09:18:35.636213	2026-04-18 17:21:01.122977	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
11	1	4	1	1	2026-04-17	2026-04-17 09:08:08.259926	2026-04-17 17:01:19.261006	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
12	1	4	1	1	2026-04-16	2026-04-16 09:14:12.516078	2026-04-16 17:24:29.903499	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
13	1	4	1	1	2026-04-14	2026-04-14 09:17:31.864723	2026-04-14 17:22:18.619268	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
14	1	4	1	1	2026-04-13	2026-04-13 09:05:02.063208	2026-04-13 17:00:57.5433	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
15	1	4	1	1	2026-04-11	2026-04-11 09:13:34.247576	2026-04-11 17:04:36.494218	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
16	1	4	1	1	2026-04-10	2026-04-10 09:18:13.511095	2026-04-10 17:15:53.288163	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
17	1	4	1	1	2026-04-09	2026-04-09 09:12:20.932754	2026-04-09 17:24:02.837398	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
18	1	4	1	1	2026-04-07	2026-04-07 09:04:36.588395	2026-04-07 17:20:11.564453	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
19	1	4	1	1	2026-04-06	2026-04-06 09:09:08.912026	2026-04-06 17:17:06.522924	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
20	1	4	1	1	2026-04-04	2026-04-04 09:17:05.154533	2026-04-04 17:26:26.660603	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
21	1	4	1	1	2026-04-03	2026-04-03 09:08:33.587907	2026-04-03 17:15:11.159822	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
22	1	4	1	1	2026-04-02	2026-04-02 09:16:57.750842	2026-04-02 17:14:52.556784	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
23	1	4	1	1	2026-03-31	2026-03-31 09:17:16.594044	2026-03-31 17:19:34.791337	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
24	1	4	1	1	2026-03-30	2026-03-30 09:02:09.180521	2026-03-30 17:04:29.348795	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
25	1	4	1	1	2026-03-28	2026-03-28 09:17:36.049604	2026-03-28 17:13:20.123759	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
26	1	4	1	1	2026-03-27	2026-03-27 09:01:22.951125	2026-03-27 17:08:46.24215	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
27	1	4	1	1	2026-03-26	2026-03-26 09:10:23.980569	2026-03-26 17:07:41.560319	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
28	1	4	1	1	2026-03-24	2026-03-24 09:19:26.353233	2026-03-24 17:23:06.338158	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
29	1	4	1	1	2026-03-23	2026-03-23 09:13:27.670684	2026-03-23 17:14:50.303855	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
30	1	4	1	1	2026-03-21	2026-03-21 09:14:16.678279	2026-03-21 17:01:37.725201	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
31	1	4	1	1	2026-03-20	2026-03-20 09:13:36.117713	2026-03-20 17:13:42.078429	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
32	1	4	1	1	2026-03-19	2026-03-19 09:04:56.782084	2026-03-19 17:26:18.294994	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
33	1	4	1	1	2026-03-17	2026-03-17 09:12:06.880258	2026-03-17 17:05:54.266208	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
34	1	4	1	1	2026-03-16	2026-03-16 09:00:00.498849	2026-03-16 17:04:24.872678	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
35	1	4	1	1	2026-03-14	2026-03-14 09:11:52.744792	2026-03-14 17:20:45.408831	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
36	1	4	1	1	2026-03-13	2026-03-13 09:01:00.792931	2026-03-13 17:14:41.996031	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
37	1	4	1	1	2026-03-12	2026-03-12 09:01:30.994284	2026-03-12 17:15:49.193292	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
38	1	4	1	1	2026-03-11	2026-03-11 09:12:19.841215	2026-03-11 17:20:19.112512	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
39	1	4	1	1	2026-03-10	2026-03-10 09:00:38.962726	2026-03-10 17:06:34.626646	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
40	1	4	1	1	2026-03-09	2026-03-09 09:18:35.591575	2026-03-09 17:15:58.293008	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
41	1	4	1	1	2026-03-07	2026-03-07 09:05:26.19314	2026-03-07 17:27:03.047986	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
42	1	4	1	1	2026-03-06	2026-03-06 09:13:09.115543	2026-03-06 17:05:09.447359	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
43	1	4	1	1	2026-03-05	2026-03-05 09:16:55.086776	2026-03-05 17:16:03.449487	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
44	1	4	1	1	2026-03-04	2026-03-04 09:10:39.618509	2026-03-04 17:20:20.608482	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
45	1	4	1	1	2026-03-03	2026-03-03 09:06:22.386988	2026-03-03 17:20:29.534796	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
46	1	4	1	1	2026-05-02	2026-05-02 08:44:47.994713	2026-05-02 15:01:46.492071	\N	\N	\N	\N	Present	\N	2026-05-02 10:44:47.994713	\N	\N
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (brand_id, brand_name, created_at) FROM stdin;
1	Wavy	2026-05-02 10:24:03.531898
2	Diapia	2026-05-02 10:24:03.531898
3	Anytime	2026-05-02 10:24:03.531898
4	Glamix	2026-05-02 10:24:03.531898
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, brand_id, category_name, created_at) FROM stdin;
1	1	Chemicals	2026-05-02 10:24:29.00939
2	1	Dishwasher	2026-05-02 10:24:29.00939
3	1	Detergent	2026-05-02 10:24:29.00939
4	2	Diapers	2026-05-02 10:24:29.00939
5	2	Wipes	2026-05-02 10:24:29.00939
6	3	Sanitary Pads	2026-05-02 10:24:29.00939
7	4	Wipes	2026-05-02 10:24:29.00939
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (city_id, city_name, created_at) FROM stdin;
101	Islamabad	2026-05-02 10:40:01.565217
\.


--
-- Data for Name: city_am_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.city_am_assignments (id, city_id, am_employee_id, start_date, end_date, is_active, created_at) FROM stdin;
2	101	2	2025-11-02	\N	t	2026-05-02 10:40:27.530847
\.


--
-- Data for Name: employee_store_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_store_assignments (assignment_id, employee_id, store_id, shift_id, start_date, end_date, is_active, created_at, tsc_employee_id) FROM stdin;
1	4	1	1	2025-11-02	\N	t	2026-05-02 10:44:14.563195	3
\.


--
-- Data for Name: gm_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gm_employees (employee_id, user_id, role_id, phone, status, joining_date, created_at, fixed_salary) FROM stdin;
1	2	1	03000000001	active	2025-11-02	2026-05-02 10:38:49.588738	0.00
2	3	2	03000000002	active	2025-11-02	2026-05-02 10:38:49.588738	0.00
3	4	3	03000000003	active	2025-11-02	2026-05-02 10:38:49.588738	0.00
4	5	4	03000000004	active	2025-11-02	2026-05-02 10:38:49.588738	33000.00
\.


--
-- Data for Name: gm_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gm_users (user_id, full_name, email, password_hash, role_id, is_active, created_at, cnic, father_name, address, bank_name, bank_account, iban, phone) FROM stdin;
2	Super Admin	admin@gmail.com	$2a$10$dSr10wbg2oivdrTGfbW75.F3nnvfI4PDsGkPY5JAAfCj6qCBsXse6	1	t	2026-05-02 09:53:37.576006	\N	\N	\N	\N	\N	\N	03000000001
3	Ali	am@gmail.com	$2a$10$eutAXNrzT7E4yYCCQrDMk.YEczekJl5alXG5uwwLeXLf6f/XHM1LK	2	t	2026-05-02 09:54:08.633119	\N	\N	\N	\N	\N	\N	03000000002
4	Ameer	tsc@gmail.com	$2a$10$3/GIgOCMoY2zYCewf3cvPewD8eDhOdcQOitdMOE6PmdqA4d0iaHR.	3	t	2026-05-02 09:54:44.969625	\N	\N	\N	\N	\N	\N	03000000003
5	Amna	ba@gmail.com	$2a$10$1ac9uhMm7G3dFTCv9pMdHuCWi0HU9SWmVfpEyXS0zZS/Rukihokiu	4	t	2026-05-02 09:55:20.01588	\N	\N	\N	\N	\N	\N	03000000004
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.holidays (holiday_id, holiday_name, holiday_date, city_id, is_national, created_at) FROM stdin;
\.


--
-- Data for Name: incentive_slabs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incentive_slabs (slab_id, slab_order, threshold_pct, incentive_pct, created_at) FROM stdin;
1	1	10.00	1.00	2026-05-02 12:32:46.47076
2	2	15.00	2.00	2026-05-02 12:32:46.47076
3	3	15.00	3.00	2026-05-02 12:32:46.47076
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaves (leave_id, employee_id, from_date, to_date, leave_type, reason, days_count, status, admin_note, reviewed_at, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name) FROM stdin;
1	Admin
2	Area Manager
3	TSE/TSO
4	Brand Ambassador
\.


--
-- Data for Name: sales_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_entries (sales_entry_id, assignment_id, employee_id, store_id, sales_date, remarks, image_path, created_at) FROM stdin;
1	1	4	1	2026-05-02	Daily sales	\N	2026-05-02 10:45:24.892566
2	1	4	1	2026-05-01	Daily sales	\N	2026-05-02 10:45:24.892566
3	1	4	1	2026-04-30	Daily sales	\N	2026-05-02 10:45:24.892566
4	1	4	1	2026-04-28	Daily sales	\N	2026-05-02 10:45:24.892566
5	1	4	1	2026-04-27	Daily sales	\N	2026-05-02 10:45:24.892566
6	1	4	1	2026-04-25	Daily sales	\N	2026-05-02 10:45:24.892566
7	1	4	1	2026-04-24	Daily sales	\N	2026-05-02 10:45:24.892566
8	1	4	1	2026-04-23	Daily sales	\N	2026-05-02 10:45:24.892566
9	1	4	1	2026-04-21	Daily sales	\N	2026-05-02 10:45:24.892566
10	1	4	1	2026-04-20	Daily sales	\N	2026-05-02 10:45:24.892566
11	1	4	1	2026-04-18	Daily sales	\N	2026-05-02 10:45:24.892566
12	1	4	1	2026-04-17	Daily sales	\N	2026-05-02 10:45:24.892566
13	1	4	1	2026-04-16	Daily sales	\N	2026-05-02 10:45:24.892566
14	1	4	1	2026-04-14	Daily sales	\N	2026-05-02 10:45:24.892566
15	1	4	1	2026-04-13	Daily sales	\N	2026-05-02 10:45:24.892566
16	1	4	1	2026-04-11	Daily sales	\N	2026-05-02 10:45:24.892566
17	1	4	1	2026-04-10	Daily sales	\N	2026-05-02 10:45:24.892566
18	1	4	1	2026-04-09	Daily sales	\N	2026-05-02 10:45:24.892566
19	1	4	1	2026-04-07	Daily sales	\N	2026-05-02 10:45:24.892566
20	1	4	1	2026-04-06	Daily sales	\N	2026-05-02 10:45:24.892566
21	1	4	1	2026-04-04	Daily sales	\N	2026-05-02 10:45:24.892566
22	1	4	1	2026-04-03	Daily sales	\N	2026-05-02 10:45:24.892566
23	1	4	1	2026-04-02	Daily sales	\N	2026-05-02 10:45:24.892566
24	1	4	1	2026-03-31	Daily sales	\N	2026-05-02 10:45:24.892566
25	1	4	1	2026-03-30	Daily sales	\N	2026-05-02 10:45:24.892566
26	1	4	1	2026-03-28	Daily sales	\N	2026-05-02 10:45:24.892566
27	1	4	1	2026-03-27	Daily sales	\N	2026-05-02 10:45:24.892566
28	1	4	1	2026-03-26	Daily sales	\N	2026-05-02 10:45:24.892566
29	1	4	1	2026-03-24	Daily sales	\N	2026-05-02 10:45:24.892566
30	1	4	1	2026-03-23	Daily sales	\N	2026-05-02 10:45:24.892566
31	1	4	1	2026-03-21	Daily sales	\N	2026-05-02 10:45:24.892566
32	1	4	1	2026-03-20	Daily sales	\N	2026-05-02 10:45:24.892566
33	1	4	1	2026-03-19	Daily sales	\N	2026-05-02 10:45:24.892566
34	1	4	1	2026-03-17	Daily sales	\N	2026-05-02 10:45:24.892566
35	1	4	1	2026-03-16	Daily sales	\N	2026-05-02 10:45:24.892566
36	1	4	1	2026-03-14	Daily sales	\N	2026-05-02 10:45:24.892566
37	1	4	1	2026-03-13	Daily sales	\N	2026-05-02 10:45:24.892566
38	1	4	1	2026-03-12	Daily sales	\N	2026-05-02 10:45:24.892566
39	1	4	1	2026-03-11	Daily sales	\N	2026-05-02 10:45:24.892566
40	1	4	1	2026-03-10	Daily sales	\N	2026-05-02 10:45:24.892566
41	1	4	1	2026-03-09	Daily sales	\N	2026-05-02 10:45:24.892566
42	1	4	1	2026-03-07	Daily sales	\N	2026-05-02 10:45:24.892566
43	1	4	1	2026-03-06	Daily sales	\N	2026-05-02 10:45:24.892566
44	1	4	1	2026-03-05	Daily sales	\N	2026-05-02 10:45:24.892566
45	1	4	1	2026-03-04	Daily sales	\N	2026-05-02 10:45:24.892566
46	1	4	1	2026-03-03	Daily sales	\N	2026-05-02 10:45:24.892566
\.


--
-- Data for Name: sales_entry_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_entry_items (sales_item_id, sales_entry_id, sku_id, qty, retail_price, created_at) FROM stdin;
1	1	1	5	450.00	2026-05-02 10:45:24.892566
2	1	2	6	600.00	2026-05-02 10:45:24.892566
3	1	3	9	600.00	2026-05-02 10:45:24.892566
4	1	4	4	260.00	2026-05-02 10:45:24.892566
5	2	1	5	450.00	2026-05-02 10:45:24.892566
6	2	2	2	600.00	2026-05-02 10:45:24.892566
7	2	3	6	600.00	2026-05-02 10:45:24.892566
8	2	4	9	260.00	2026-05-02 10:45:24.892566
9	3	1	2	450.00	2026-05-02 10:45:24.892566
10	3	2	8	600.00	2026-05-02 10:45:24.892566
11	3	3	2	600.00	2026-05-02 10:45:24.892566
12	3	4	2	260.00	2026-05-02 10:45:24.892566
13	4	1	8	450.00	2026-05-02 10:45:24.892566
14	4	2	5	600.00	2026-05-02 10:45:24.892566
15	4	3	7	600.00	2026-05-02 10:45:24.892566
16	4	4	2	260.00	2026-05-02 10:45:24.892566
17	5	1	6	450.00	2026-05-02 10:45:24.892566
18	5	2	3	600.00	2026-05-02 10:45:24.892566
19	5	3	5	600.00	2026-05-02 10:45:24.892566
20	5	4	6	260.00	2026-05-02 10:45:24.892566
21	6	1	5	450.00	2026-05-02 10:45:24.892566
22	6	2	3	600.00	2026-05-02 10:45:24.892566
23	6	3	7	600.00	2026-05-02 10:45:24.892566
24	6	4	8	260.00	2026-05-02 10:45:24.892566
25	7	1	8	450.00	2026-05-02 10:45:24.892566
26	7	2	8	600.00	2026-05-02 10:45:24.892566
27	7	3	7	600.00	2026-05-02 10:45:24.892566
28	7	4	5	260.00	2026-05-02 10:45:24.892566
29	8	1	7	450.00	2026-05-02 10:45:24.892566
30	8	2	4	600.00	2026-05-02 10:45:24.892566
31	8	3	4	600.00	2026-05-02 10:45:24.892566
32	8	4	2	260.00	2026-05-02 10:45:24.892566
33	9	1	5	450.00	2026-05-02 10:45:24.892566
34	9	2	2	600.00	2026-05-02 10:45:24.892566
35	9	3	5	600.00	2026-05-02 10:45:24.892566
36	9	4	8	260.00	2026-05-02 10:45:24.892566
37	10	1	6	450.00	2026-05-02 10:45:24.892566
38	10	2	4	600.00	2026-05-02 10:45:24.892566
39	10	3	5	600.00	2026-05-02 10:45:24.892566
40	10	4	4	260.00	2026-05-02 10:45:24.892566
41	11	1	9	450.00	2026-05-02 10:45:24.892566
42	11	2	2	600.00	2026-05-02 10:45:24.892566
43	11	3	7	600.00	2026-05-02 10:45:24.892566
44	11	4	3	260.00	2026-05-02 10:45:24.892566
45	12	1	6	450.00	2026-05-02 10:45:24.892566
46	12	2	4	600.00	2026-05-02 10:45:24.892566
47	12	3	9	600.00	2026-05-02 10:45:24.892566
48	12	4	9	260.00	2026-05-02 10:45:24.892566
49	13	1	3	450.00	2026-05-02 10:45:24.892566
50	13	2	7	600.00	2026-05-02 10:45:24.892566
51	13	3	5	600.00	2026-05-02 10:45:24.892566
52	13	4	9	260.00	2026-05-02 10:45:24.892566
53	14	1	7	450.00	2026-05-02 10:45:24.892566
54	14	2	8	600.00	2026-05-02 10:45:24.892566
55	14	3	5	600.00	2026-05-02 10:45:24.892566
56	14	4	3	260.00	2026-05-02 10:45:24.892566
57	15	1	3	450.00	2026-05-02 10:45:24.892566
58	15	2	2	600.00	2026-05-02 10:45:24.892566
59	15	3	3	600.00	2026-05-02 10:45:24.892566
60	15	4	6	260.00	2026-05-02 10:45:24.892566
61	16	1	2	450.00	2026-05-02 10:45:24.892566
62	16	2	2	600.00	2026-05-02 10:45:24.892566
63	16	3	3	600.00	2026-05-02 10:45:24.892566
64	16	4	4	260.00	2026-05-02 10:45:24.892566
65	17	1	8	450.00	2026-05-02 10:45:24.892566
66	17	2	5	600.00	2026-05-02 10:45:24.892566
67	17	3	8	600.00	2026-05-02 10:45:24.892566
68	17	4	7	260.00	2026-05-02 10:45:24.892566
69	18	1	5	450.00	2026-05-02 10:45:24.892566
70	18	2	4	600.00	2026-05-02 10:45:24.892566
71	18	3	5	600.00	2026-05-02 10:45:24.892566
72	18	4	8	260.00	2026-05-02 10:45:24.892566
73	19	1	5	450.00	2026-05-02 10:45:24.892566
74	19	2	6	600.00	2026-05-02 10:45:24.892566
75	19	3	7	600.00	2026-05-02 10:45:24.892566
76	19	4	2	260.00	2026-05-02 10:45:24.892566
77	20	1	3	450.00	2026-05-02 10:45:24.892566
78	20	2	9	600.00	2026-05-02 10:45:24.892566
79	20	3	7	600.00	2026-05-02 10:45:24.892566
80	20	4	2	260.00	2026-05-02 10:45:24.892566
81	21	1	9	450.00	2026-05-02 10:45:24.892566
82	21	2	9	600.00	2026-05-02 10:45:24.892566
83	21	3	4	600.00	2026-05-02 10:45:24.892566
84	21	4	4	260.00	2026-05-02 10:45:24.892566
85	22	1	9	450.00	2026-05-02 10:45:24.892566
86	22	2	2	600.00	2026-05-02 10:45:24.892566
87	22	3	3	600.00	2026-05-02 10:45:24.892566
88	22	4	4	260.00	2026-05-02 10:45:24.892566
89	23	1	4	450.00	2026-05-02 10:45:24.892566
90	23	2	9	600.00	2026-05-02 10:45:24.892566
91	23	3	4	600.00	2026-05-02 10:45:24.892566
92	23	4	6	260.00	2026-05-02 10:45:24.892566
93	24	1	9	450.00	2026-05-02 10:45:24.892566
94	24	2	7	600.00	2026-05-02 10:45:24.892566
95	24	3	2	600.00	2026-05-02 10:45:24.892566
96	24	4	7	260.00	2026-05-02 10:45:24.892566
97	25	1	7	450.00	2026-05-02 10:45:24.892566
98	25	2	5	600.00	2026-05-02 10:45:24.892566
99	25	3	3	600.00	2026-05-02 10:45:24.892566
100	25	4	8	260.00	2026-05-02 10:45:24.892566
101	26	1	6	450.00	2026-05-02 10:45:24.892566
102	26	2	4	600.00	2026-05-02 10:45:24.892566
103	26	3	2	600.00	2026-05-02 10:45:24.892566
104	26	4	4	260.00	2026-05-02 10:45:24.892566
105	27	1	6	450.00	2026-05-02 10:45:24.892566
106	27	2	7	600.00	2026-05-02 10:45:24.892566
107	27	3	4	600.00	2026-05-02 10:45:24.892566
108	27	4	9	260.00	2026-05-02 10:45:24.892566
109	28	1	4	450.00	2026-05-02 10:45:24.892566
110	28	2	7	600.00	2026-05-02 10:45:24.892566
111	28	3	5	600.00	2026-05-02 10:45:24.892566
112	28	4	3	260.00	2026-05-02 10:45:24.892566
113	29	1	9	450.00	2026-05-02 10:45:24.892566
114	29	2	7	600.00	2026-05-02 10:45:24.892566
115	29	3	9	600.00	2026-05-02 10:45:24.892566
116	29	4	5	260.00	2026-05-02 10:45:24.892566
117	30	1	2	450.00	2026-05-02 10:45:24.892566
118	30	2	2	600.00	2026-05-02 10:45:24.892566
119	30	3	7	600.00	2026-05-02 10:45:24.892566
120	30	4	7	260.00	2026-05-02 10:45:24.892566
121	31	1	9	450.00	2026-05-02 10:45:24.892566
122	31	2	6	600.00	2026-05-02 10:45:24.892566
123	31	3	3	600.00	2026-05-02 10:45:24.892566
124	31	4	3	260.00	2026-05-02 10:45:24.892566
125	32	1	4	450.00	2026-05-02 10:45:24.892566
126	32	2	5	600.00	2026-05-02 10:45:24.892566
127	32	3	7	600.00	2026-05-02 10:45:24.892566
128	32	4	7	260.00	2026-05-02 10:45:24.892566
129	33	1	3	450.00	2026-05-02 10:45:24.892566
130	33	2	8	600.00	2026-05-02 10:45:24.892566
131	33	3	5	600.00	2026-05-02 10:45:24.892566
132	33	4	6	260.00	2026-05-02 10:45:24.892566
133	34	1	4	450.00	2026-05-02 10:45:24.892566
134	34	2	5	600.00	2026-05-02 10:45:24.892566
135	34	3	2	600.00	2026-05-02 10:45:24.892566
136	34	4	3	260.00	2026-05-02 10:45:24.892566
137	35	1	8	450.00	2026-05-02 10:45:24.892566
138	35	2	4	600.00	2026-05-02 10:45:24.892566
139	35	3	6	600.00	2026-05-02 10:45:24.892566
140	35	4	5	260.00	2026-05-02 10:45:24.892566
141	36	1	3	450.00	2026-05-02 10:45:24.892566
142	36	2	4	600.00	2026-05-02 10:45:24.892566
143	36	3	4	600.00	2026-05-02 10:45:24.892566
144	36	4	8	260.00	2026-05-02 10:45:24.892566
145	37	1	6	450.00	2026-05-02 10:45:24.892566
146	37	2	7	600.00	2026-05-02 10:45:24.892566
147	37	3	3	600.00	2026-05-02 10:45:24.892566
148	37	4	7	260.00	2026-05-02 10:45:24.892566
149	38	1	3	450.00	2026-05-02 10:45:24.892566
150	38	2	5	600.00	2026-05-02 10:45:24.892566
151	38	3	8	600.00	2026-05-02 10:45:24.892566
152	38	4	3	260.00	2026-05-02 10:45:24.892566
153	39	1	6	450.00	2026-05-02 10:45:24.892566
154	39	2	5	600.00	2026-05-02 10:45:24.892566
155	39	3	6	600.00	2026-05-02 10:45:24.892566
156	39	4	4	260.00	2026-05-02 10:45:24.892566
157	40	1	4	450.00	2026-05-02 10:45:24.892566
158	40	2	7	600.00	2026-05-02 10:45:24.892566
159	40	3	6	600.00	2026-05-02 10:45:24.892566
160	40	4	8	260.00	2026-05-02 10:45:24.892566
161	41	1	3	450.00	2026-05-02 10:45:24.892566
162	41	2	5	600.00	2026-05-02 10:45:24.892566
163	41	3	9	600.00	2026-05-02 10:45:24.892566
164	41	4	3	260.00	2026-05-02 10:45:24.892566
165	42	1	9	450.00	2026-05-02 10:45:24.892566
166	42	2	7	600.00	2026-05-02 10:45:24.892566
167	42	3	6	600.00	2026-05-02 10:45:24.892566
168	42	4	8	260.00	2026-05-02 10:45:24.892566
169	43	1	5	450.00	2026-05-02 10:45:24.892566
170	43	2	7	600.00	2026-05-02 10:45:24.892566
171	43	3	2	600.00	2026-05-02 10:45:24.892566
172	43	4	5	260.00	2026-05-02 10:45:24.892566
173	44	1	5	450.00	2026-05-02 10:45:24.892566
174	44	2	3	600.00	2026-05-02 10:45:24.892566
175	44	3	9	600.00	2026-05-02 10:45:24.892566
176	44	4	5	260.00	2026-05-02 10:45:24.892566
177	45	1	3	450.00	2026-05-02 10:45:24.892566
178	45	2	8	600.00	2026-05-02 10:45:24.892566
179	45	3	9	600.00	2026-05-02 10:45:24.892566
180	45	4	2	260.00	2026-05-02 10:45:24.892566
181	46	1	5	450.00	2026-05-02 10:45:24.892566
182	46	2	8	600.00	2026-05-02 10:45:24.892566
183	46	3	2	600.00	2026-05-02 10:45:24.892566
184	46	4	5	260.00	2026-05-02 10:45:24.892566
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (shift_id, shift_name, start_time, end_time, created_at) FROM stdin;
1	Morning	09:00:00	17:00:00	2026-05-02 10:43:34.324367
2	Evening	14:00:00	22:00:00	2026-05-02 10:43:34.324367
\.


--
-- Data for Name: skus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skus (sku_id, category_id, sku_name, unit_of_measure, retail_price, is_active, created_at, size, wholesale_price, lmt_price_ex_tax, lmt_price_in_tax, s_tax_rate, consumer_price) FROM stdin;
1	1	Phenyl White - 3 Liter (1x6)	CTN	381.36	t	2026-05-02 10:27:08.451101	3 Ltr	381.36	\N	\N	0.00	450.00
2	1	Phenyl Jasmine - 2.75 Liter (1x6)	CTN	508.47	t	2026-05-02 10:27:08.451101	3 Ltr	508.47	\N	\N	0.00	600.00
3	1	Phenyl Lavender - 3 Liter (1x6)	CTN	508.47	t	2026-05-02 10:27:08.451101	3 Ltr	508.47	\N	\N	0.00	600.00
4	1	Phenyl White - 1 Liter (1x12)	CTN	220.34	t	2026-05-02 10:27:08.451101	1 Ltr	220.34	\N	\N	0.00	260.00
5	1	Phenyl Jasmine - 1 Liter (1x12)	CTN	305.08	t	2026-05-02 10:27:08.451101	1 Ltr	305.08	\N	\N	0.00	360.00
6	1	Phenyl Lavender - 1 Liter (1x12)	CTN	305.08	t	2026-05-02 10:27:08.451101	1 Ltr	305.08	\N	\N	0.00	360.00
7	1	Sweep - 600 ml (1x12)	CTN	127.12	t	2026-05-02 10:27:08.451101	600 ml	127.12	\N	\N	0.00	150.00
8	1	Sweep - 1250 ml (1x12)	CTN	237.29	t	2026-05-02 10:27:08.451101	1250 ml	237.29	\N	\N	0.00	280.00
9	1	Sweep - 2.75 Liter (1x6)	CTN	500.00	t	2026-05-02 10:27:08.451101	2.75 Ltr	500.00	\N	\N	0.00	590.00
10	1	Toilet Cleaner - 750 ml (1x12)	CTN	572.03	t	2026-05-02 10:27:08.451101	750 ml	572.03	\N	\N	0.00	675.00
11	1	Toilet Cleaner - 500 ml (1x12)	CTN	381.36	t	2026-05-02 10:27:08.451101	500 ml	381.36	\N	\N	0.00	450.00
12	1	Toilet Cleaner - 250 ml (1x24)	CTN	237.29	t	2026-05-02 10:27:08.451101	250 ml	237.29	\N	\N	0.00	280.00
13	1	Bathroom Cleaner - 250 ml (1x24)	CTN	237.29	t	2026-05-02 10:27:08.451101	250 ml	237.29	\N	\N	0.00	280.00
14	1	Bathroom Cleaner - 500 ml (1x12)	CTN	487.29	t	2026-05-02 10:27:08.451101	500 ml	487.29	\N	\N	0.00	575.00
15	1	Surface Cleaner Lemon - 1 Liter (1x12)	CTN	889.83	t	2026-05-02 10:27:08.451101	1 Ltr	889.83	\N	\N	0.00	1050.00
16	1	Surface Cleaner Aqua - 1 Liter (1x12)	CTN	889.83	t	2026-05-02 10:27:08.451101	1 Ltr	889.83	\N	\N	0.00	1050.00
17	1	Surface Cleaner Lemon - 500 ml (1x12)	CTN	466.10	t	2026-05-02 10:27:08.451101	500 ml	466.10	\N	\N	0.00	550.00
18	1	Surface Cleaner Aqua - 500 ml (1x12)	CTN	466.10	t	2026-05-02 10:27:08.451101	500 ml	466.10	\N	\N	0.00	550.00
19	3	Washing Powder - 50gm (300 each)	CTN	8.47	t	2026-05-02 10:31:32.144677	50 gm	8.47	\N	\N	0.00	10.00
20	3	Washing Powder - 200 gm (1x5x12)	CTN	83.90	t	2026-05-02 10:31:32.144677	200 gm	83.90	\N	\N	0.00	99.00
21	3	Washing Powder - 500 gm (1x24)	CTN	220.34	t	2026-05-02 10:31:32.144677	500 gm	220.34	\N	\N	0.00	260.00
22	3	Washing Powder - 1 Kg (1x12)	CTN	440.68	t	2026-05-02 10:31:32.144677	1 KG	440.68	\N	\N	0.00	520.00
23	3	Washing Powder - 2 Kg (1x6)	CTN	830.51	t	2026-05-02 10:31:32.144677	2 KG	830.51	\N	\N	0.00	980.00
24	3	Washing Powder - 3 Kg (1x4)	CTN	1262.71	t	2026-05-02 10:31:32.144677	3 KG	1262.71	\N	\N	0.00	1490.00
25	2	Dishwash Liquid Ultra - 475 ml (1x12)	CTN	330.51	t	2026-05-02 10:32:24.353715	475 ml	330.51	\N	\N	0.00	390.00
26	2	Dishwash Liquid HDPE - 475 ml (1x12)	CTN	211.86	t	2026-05-02 10:32:24.353715	475 ml	211.86	\N	\N	0.00	250.00
27	2	Dishwash Gel Lime - 475 ml (1x12)	CTN	330.51	t	2026-05-02 10:32:24.353715	475 ml	330.51	\N	\N	0.00	390.00
28	2	Dishwash Gel Orange - 475 ml (1x12)	CTN	330.51	t	2026-05-02 10:32:24.353715	475 ml	330.51	\N	\N	0.00	390.00
29	2	Dishwash Gel Lavender - 475 ml (1x12)	CTN	360.17	t	2026-05-02 10:32:24.353715	475 ml	360.17	\N	\N	0.00	425.00
30	2	Dishwash Liquid HDPE - 275 ml (1x24)	CTN	148.31	t	2026-05-02 10:32:24.353715	275 ml	148.31	\N	\N	0.00	175.00
31	2	Dishwash Bar - 85 gm (1x96)	CTN	25.42	t	2026-05-02 10:32:24.353715	85 gm	25.42	\N	\N	0.00	30.00
32	2	Dishwash Bar - 165 gm (1x48)	CTN	42.37	t	2026-05-02 10:32:24.353715	165 gm	42.37	\N	\N	0.00	50.00
33	2	Dishwash Long Bar - 265 gm (1x48)	CTN	63.56	t	2026-05-02 10:32:24.353715	265 gm	63.56	\N	\N	0.00	75.00
34	2	Dishwash Bar 110 gm (1x72)	CTN	29.66	t	2026-05-02 10:32:24.353715	110 gm	29.66	\N	\N	0.00	35.00
35	2	Dishwash Bar 290 gm (1x48)	CTN	72.03	t	2026-05-02 10:32:24.353715	290 gm	72.03	\N	\N	0.00	85.00
36	2	Dishwash Double Bar - 530 gm (1x24)	CTN	127.12	t	2026-05-02 10:32:24.353715	530 gm	127.12	\N	\N	0.00	150.00
37	2	Steel Scrubber - Economy (1x20x12)	CTN	67.80	t	2026-05-02 10:32:24.353715	15 gm	67.80	\N	\N	0.00	80.00
38	2	Steel Scrubber - Jumboo (1x12x12)	CTN	127.12	t	2026-05-02 10:32:24.353715	30 gm	127.12	\N	\N	0.00	150.00
39	2	Steel Scrubber - 2in1 (1x12x12)	CTN	135.59	t	2026-05-02 10:32:24.353715	30 gm	135.59	\N	\N	0.00	160.00
40	2	Scouring Pad - Economy (1x10x12)	CTN	211.86	t	2026-05-02 10:32:24.353715	Small	211.86	\N	\N	0.00	250.00
41	2	Scouring Pad Single - Large (1x12x24)	CTN	63.56	t	2026-05-02 10:32:24.353715	Large	63.56	\N	\N	0.00	75.00
42	2	Nail Saver - Single (1x12x12)	CTN	105.93	t	2026-05-02 10:32:24.353715	Small	105.93	\N	\N	0.00	125.00
43	2	Nail Saver - 2 in 1 (1x12x18)	CTN	207.63	t	2026-05-02 10:32:24.353715	2 In 1	207.63	\N	\N	0.00	245.00
44	2	Nail Saver - 3 in 1 (1x12x12)	CTN	309.32	t	2026-05-02 10:32:24.353715	3 in 1	309.32	\N	\N	0.00	365.00
45	4	Diapia Mega - Small (1x6x80)	CTN	2542.37	t	2026-05-02 10:33:29.933686	(1x80)	2542.37	\N	\N	0.00	3000.00
46	4	Diapia Mega - Medium (1x6x72)	CTN	2542.37	t	2026-05-02 10:33:29.933686	(1x72)	2542.37	\N	\N	0.00	3000.00
47	4	Diapia Mega - Large (1x6x64)	CTN	2542.37	t	2026-05-02 10:33:29.933686	(1x64)	2542.37	\N	\N	0.00	3000.00
48	4	Diapia Mega - Xtra Large (1x6x56)	CTN	2542.37	t	2026-05-02 10:33:29.933686	(1x56)	2542.37	\N	\N	0.00	3000.00
49	4	Diapia Regular - Small (1x6x68)	CTN	2182.20	t	2026-05-02 10:33:29.933686	(1x68)	2182.20	\N	\N	0.00	2575.00
50	4	Diapia Regular - Medium (1x6x60)	CTN	2182.20	t	2026-05-02 10:33:29.933686	(1x60)	2182.20	\N	\N	0.00	2575.00
51	4	Diapia Regular - Large (1x6x54)	CTN	2182.20	t	2026-05-02 10:33:29.933686	(1x54)	2182.20	\N	\N	0.00	2575.00
52	4	Diapia Regular - XLarge (1x6x48)	CTN	2182.20	t	2026-05-02 10:33:29.933686	(1x48)	2182.20	\N	\N	0.00	2575.00
53	4	Diapia Regular - XXL (1x6x40)	CTN	2182.20	t	2026-05-02 10:33:29.933686	(1x40)	2182.20	\N	\N	0.00	2575.00
54	4	Diapia Economy - Small (1x8x40)	CTN	1313.56	t	2026-05-02 10:33:29.933686	(1x40)	1313.56	\N	\N	0.00	1550.00
55	4	Diapia Economy - Medium (1x8x36)	CTN	1313.56	t	2026-05-02 10:33:29.933686	(1x36)	1313.56	\N	\N	0.00	1550.00
56	4	Diapia Economy - Large (1x8x32)	CTN	1313.56	t	2026-05-02 10:33:29.933686	(1x32)	1313.56	\N	\N	0.00	1550.00
57	4	Diapia Economy - XLarge (1x8x28)	CTN	1313.56	t	2026-05-02 10:33:29.933686	(1x28)	1313.56	\N	\N	0.00	1550.00
58	5	Diapia Wet Wipes (1x24x72)	CTN	254.24	t	2026-05-02 10:33:29.933686	(1x72)	254.24	\N	\N	0.00	300.00
59	6	AnyTime Maxi Thick - Regular XL (1x48x8)	CTN	254.24	t	2026-05-02 10:33:29.933686	(1x8)	254.24	\N	\N	0.00	300.00
60	6	AnyTime Maxi Thick - Regular Large (1x48x9)	CTN	254.24	t	2026-05-02 10:33:29.933686	(1x9)	254.24	\N	\N	0.00	300.00
61	6	AnyTime Maxi Thick - XL (1x24x16)	CTN	508.47	t	2026-05-02 10:33:29.933686	(1x16)	508.47	\N	\N	0.00	600.00
62	6	AnyTime Maxi Thick - Large (1x24x18)	CTN	508.47	t	2026-05-02 10:33:29.933686	(1x18)	508.47	\N	\N	0.00	600.00
63	6	AnyTime Ultra Thin - Regular XL (1x48x7)	CTN	254.24	t	2026-05-02 10:33:29.933686	(1x7)	254.24	\N	\N	0.00	300.00
64	6	AnyTime Ultra Thin - Regular Large (1x48x8)	CTN	254.24	t	2026-05-02 10:33:29.933686	(1x8)	254.24	\N	\N	0.00	300.00
65	6	AnyTime Ultra Thin - TP XL (1x24x14)	CTN	508.47	t	2026-05-02 10:33:29.933686	(1x14)	508.47	\N	\N	0.00	600.00
66	6	AnyTime Ultra Thin - TP Large (1x24x16)	CTN	508.47	t	2026-05-02 10:33:29.933686	(1x16)	508.47	\N	\N	0.00	600.00
67	7	Glamix Baby Wet Wipes (1x24x64)	CTN	381.36	t	2026-05-02 10:33:29.933686	(1x64)	381.36	\N	\N	0.00	450.00
\.


--
-- Data for Name: store_monthly_targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_monthly_targets (target_id, store_id, month, year, target_amount, created_at) FROM stdin;
1	1	5	2026	300000.00	2026-05-02 12:34:02.766591
\.


--
-- Data for Name: store_pricing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_pricing (pricing_id, store_id, sku_id, tse_price, ba_price, effective_from, created_at) FROM stdin;
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stores (store_id, store_name, city_id, address, latitude, longitude, allowed_radius_meters, created_at) FROM stdin;
1	Store A	101	Islamabad	33.68440000	73.04790000	100	2026-05-02 10:42:11.610305
\.


--
-- Data for Name: tsc_store_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tsc_store_assignments (id, tsc_employee_id, store_id, start_date, end_date, is_active, created_at) FROM stdin;
\.


--
-- Name: am_tsc_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.am_tsc_assignments_id_seq', 1, true);


--
-- Name: attendance_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_attendance_id_seq', 46, true);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brands_brand_id_seq', 4, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 7, true);


--
-- Name: cities_city_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cities_city_id_seq', 101, true);


--
-- Name: city_am_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.city_am_assignments_id_seq', 2, true);


--
-- Name: employee_store_assignments_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_store_assignments_assignment_id_seq', 1, true);


--
-- Name: gm_employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gm_employees_employee_id_seq', 4, true);


--
-- Name: gm_users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gm_users_user_id_seq', 5, true);


--
-- Name: holidays_holiday_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.holidays_holiday_id_seq', 1, false);


--
-- Name: incentive_slabs_slab_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incentive_slabs_slab_id_seq', 3, true);


--
-- Name: leaves_leave_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leaves_leave_id_seq', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 1, false);


--
-- Name: sales_entries_sales_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_entries_sales_entry_id_seq', 46, true);


--
-- Name: sales_entry_items_sales_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_entry_items_sales_item_id_seq', 184, true);


--
-- Name: shifts_shift_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shifts_shift_id_seq', 2, true);


--
-- Name: skus_sku_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skus_sku_id_seq', 67, true);


--
-- Name: store_monthly_targets_target_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_monthly_targets_target_id_seq', 1, true);


--
-- Name: store_pricing_pricing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_pricing_pricing_id_seq', 1, false);


--
-- Name: stores_store_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stores_store_id_seq', 1, true);


--
-- Name: tsc_store_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tsc_store_assignments_id_seq', 1, false);


--
-- Name: am_tsc_assignments am_tsc_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.am_tsc_assignments
    ADD CONSTRAINT am_tsc_assignments_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (attendance_id);


--
-- Name: brands brands_brand_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_brand_name_key UNIQUE (brand_name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (brand_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: cities cities_city_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_city_name_key UNIQUE (city_name);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (city_id);


--
-- Name: city_am_assignments city_am_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city_am_assignments
    ADD CONSTRAINT city_am_assignments_pkey PRIMARY KEY (id);


--
-- Name: employee_store_assignments employee_store_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_store_assignments
    ADD CONSTRAINT employee_store_assignments_pkey PRIMARY KEY (assignment_id);


--
-- Name: gm_employees gm_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_employees
    ADD CONSTRAINT gm_employees_pkey PRIMARY KEY (employee_id);


--
-- Name: gm_employees gm_employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_employees
    ADD CONSTRAINT gm_employees_user_id_key UNIQUE (user_id);


--
-- Name: gm_users gm_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_users
    ADD CONSTRAINT gm_users_email_key UNIQUE (email);


--
-- Name: gm_users gm_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_users
    ADD CONSTRAINT gm_users_pkey PRIMARY KEY (user_id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (holiday_id);


--
-- Name: incentive_slabs incentive_slabs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incentive_slabs
    ADD CONSTRAINT incentive_slabs_pkey PRIMARY KEY (slab_id);


--
-- Name: incentive_slabs incentive_slabs_slab_order_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incentive_slabs
    ADD CONSTRAINT incentive_slabs_slab_order_key UNIQUE (slab_order);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (leave_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: sales_entries sales_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries
    ADD CONSTRAINT sales_entries_pkey PRIMARY KEY (sales_entry_id);


--
-- Name: sales_entry_items sales_entry_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entry_items
    ADD CONSTRAINT sales_entry_items_pkey PRIMARY KEY (sales_item_id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (shift_id);


--
-- Name: skus skus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skus
    ADD CONSTRAINT skus_pkey PRIMARY KEY (sku_id);


--
-- Name: store_monthly_targets store_monthly_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_monthly_targets
    ADD CONSTRAINT store_monthly_targets_pkey PRIMARY KEY (target_id);


--
-- Name: store_monthly_targets store_monthly_targets_store_id_month_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_monthly_targets
    ADD CONSTRAINT store_monthly_targets_store_id_month_year_key UNIQUE (store_id, month, year);


--
-- Name: store_pricing store_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_pricing
    ADD CONSTRAINT store_pricing_pkey PRIMARY KEY (pricing_id);


--
-- Name: store_pricing store_pricing_store_id_sku_id_effective_from_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_pricing
    ADD CONSTRAINT store_pricing_store_id_sku_id_effective_from_key UNIQUE (store_id, sku_id, effective_from);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (store_id);


--
-- Name: tsc_store_assignments tsc_store_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tsc_store_assignments
    ADD CONSTRAINT tsc_store_assignments_pkey PRIMARY KEY (id);


--
-- Name: attendance uq_attendance_employee_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, attendance_date);


--
-- Name: sales_entries uq_sales_employee_store_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries
    ADD CONSTRAINT uq_sales_employee_store_date UNIQUE (employee_id, store_id, sales_date);


--
-- Name: idx_store_pricing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_store_pricing ON public.store_pricing USING btree (store_id, sku_id);


--
-- Name: uq_cnic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_cnic ON public.gm_users USING btree (cnic) WHERE (cnic IS NOT NULL);


--
-- Name: uq_one_active_assignment_per_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_one_active_assignment_per_employee ON public.employee_store_assignments USING btree (employee_id) WHERE (is_active = true);


--
-- Name: uq_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_phone ON public.gm_users USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: am_tsc_assignments am_tsc_assignments_am_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.am_tsc_assignments
    ADD CONSTRAINT am_tsc_assignments_am_employee_id_fkey FOREIGN KEY (am_employee_id) REFERENCES public.gm_employees(employee_id);


--
-- Name: am_tsc_assignments am_tsc_assignments_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.am_tsc_assignments
    ADD CONSTRAINT am_tsc_assignments_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(city_id);


--
-- Name: am_tsc_assignments am_tsc_assignments_tsc_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.am_tsc_assignments
    ADD CONSTRAINT am_tsc_assignments_tsc_employee_id_fkey FOREIGN KEY (tsc_employee_id) REFERENCES public.gm_employees(employee_id);


--
-- Name: categories categories_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id);


--
-- Name: city_am_assignments city_am_assignments_am_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city_am_assignments
    ADD CONSTRAINT city_am_assignments_am_employee_id_fkey FOREIGN KEY (am_employee_id) REFERENCES public.gm_employees(employee_id);


--
-- Name: city_am_assignments city_am_assignments_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city_am_assignments
    ADD CONSTRAINT city_am_assignments_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(city_id);


--
-- Name: employee_store_assignments employee_store_assignments_tsc_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_store_assignments
    ADD CONSTRAINT employee_store_assignments_tsc_employee_id_fkey FOREIGN KEY (tsc_employee_id) REFERENCES public.gm_employees(employee_id);


--
-- Name: employee_store_assignments fk_assignment_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_store_assignments
    ADD CONSTRAINT fk_assignment_employee FOREIGN KEY (employee_id) REFERENCES public.gm_employees(employee_id);


--
-- Name: employee_store_assignments fk_assignment_shift; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_store_assignments
    ADD CONSTRAINT fk_assignment_shift FOREIGN KEY (shift_id) REFERENCES public.shifts(shift_id);


--
-- Name: employee_store_assignments fk_assignment_store; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_store_assignments
    ADD CONSTRAINT fk_assignment_store FOREIGN KEY (store_id) REFERENCES public.stores(store_id);


--
-- Name: attendance fk_attendance_assignment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_assignment FOREIGN KEY (assignment_id) REFERENCES public.employee_store_assignments(assignment_id);


--
-- Name: attendance fk_attendance_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES public.gm_employees(employee_id);


--
-- Name: attendance fk_attendance_shift; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_shift FOREIGN KEY (shift_id) REFERENCES public.shifts(shift_id);


--
-- Name: attendance fk_attendance_store; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_store FOREIGN KEY (store_id) REFERENCES public.stores(store_id);


--
-- Name: gm_employees fk_employee_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_employees
    ADD CONSTRAINT fk_employee_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: gm_employees fk_employee_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_employees
    ADD CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES public.gm_users(user_id) ON DELETE CASCADE;


--
-- Name: holidays fk_holiday_city; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT fk_holiday_city FOREIGN KEY (city_id) REFERENCES public.cities(city_id);


--
-- Name: sales_entries fk_sales_assignment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries
    ADD CONSTRAINT fk_sales_assignment FOREIGN KEY (assignment_id) REFERENCES public.employee_store_assignments(assignment_id);


--
-- Name: sales_entries fk_sales_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries
    ADD CONSTRAINT fk_sales_employee FOREIGN KEY (employee_id) REFERENCES public.gm_employees(employee_id);


--
-- Name: sales_entry_items fk_sales_item_entry; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entry_items
    ADD CONSTRAINT fk_sales_item_entry FOREIGN KEY (sales_entry_id) REFERENCES public.sales_entries(sales_entry_id);


--
-- Name: sales_entry_items fk_sales_item_sku; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entry_items
    ADD CONSTRAINT fk_sales_item_sku FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id);


--
-- Name: sales_entries fk_sales_store; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_entries
    ADD CONSTRAINT fk_sales_store FOREIGN KEY (store_id) REFERENCES public.stores(store_id);


--
-- Name: gm_users gm_users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gm_users
    ADD CONSTRAINT gm_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: leaves leaves_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.gm_employees(employee_id) ON DELETE CASCADE;


--
-- Name: skus skus_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skus
    ADD CONSTRAINT skus_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- Name: store_monthly_targets store_monthly_targets_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_monthly_targets
    ADD CONSTRAINT store_monthly_targets_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id);


--
-- Name: store_pricing store_pricing_sku_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_pricing
    ADD CONSTRAINT store_pricing_sku_id_fkey FOREIGN KEY (sku_id) REFERENCES public.skus(sku_id);


--
-- Name: store_pricing store_pricing_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_pricing
    ADD CONSTRAINT store_pricing_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id);


--
-- Name: stores stores_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(city_id);


--
-- Name: tsc_store_assignments tsc_store_assignments_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tsc_store_assignments
    ADD CONSTRAINT tsc_store_assignments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id);


--
-- Name: tsc_store_assignments tsc_store_assignments_tsc_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tsc_store_assignments
    ADD CONSTRAINT tsc_store_assignments_tsc_employee_id_fkey FOREIGN KEY (tsc_employee_id) REFERENCES public.gm_employees(employee_id);


--
-- PostgreSQL database dump complete
--

\unrestrict MgSGcHS4BnQhzm4CSGJExCHMHgxbP40OUb7sHzrsDAZp9krQJ1iW4pwQ3mL3kCn


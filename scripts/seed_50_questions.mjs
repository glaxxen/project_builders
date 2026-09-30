import postgres from 'postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const directMatch = env.match(/DIRECT_URL="([^"]+)"/);
const poolMatch = env.match(/DATABASE_URL="([^"]+)"/);
const url = directMatch ? directMatch[1] : (poolMatch ? poolMatch[1] : '');

if (!url) {
  console.error('Database connection URL not found in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase (direct port 5432) to seed 50 Week 1 Questions...');
const sql = postgres(url, { ssl: 'require', prepare: false, connect_timeout: 30 });

const questions = [
  // --- Section 1: Fundamentals of Data Analysis ---
  {
    prompt: "What is the core definition of Data Analysis taught in class?",
    points: 2,
    correct: 0,
    options: [
      { text: "Turning raw facts (numbers, text, dates) into patterns and answers that help you decide something.", explanation: "Slide 1 explicitly defines Data Analysis as turning raw facts into patterns and answers for decision-making." },
      { text: "Writing complex Python algorithms to replace human decision-makers.", explanation: "Data analysis informs decision-makers, not replaces them with AI." },
      { text: "Memorizing database syntax and creating 3D computer graphics.", explanation: "Data analysis is about patterns and practical answers." },
      { text: "Collecting infinite data without any specific business goal.", explanation: "Data analysis begins with a clear business question." }
    ]
  },
  {
    prompt: "In a structured data table, what does a single 'row' represent?",
    points: 2,
    correct: 1,
    options: [
      { text: "One category of information such as Country or Product.", explanation: "That is a column (dimension)." },
      { text: "One record, one event, or one entry (e.g. one sale, one customer, one transaction).", explanation: "Slide 1 defines a row as one individual transaction/record/event." },
      { text: "The grand total of all numerical calculations.", explanation: "Totals are metrics, not rows." },
      { text: "A chart visualization on a dashboard.", explanation: "Rows are the foundational entries in a table." }
    ]
  },
  {
    prompt: "In a spreadsheet or database, what does a 'column' represent?",
    points: 2,
    correct: 2,
    options: [
      { text: "An entire historical database backup.", explanation: "Incorrect." },
      { text: "A single transaction receipt.", explanation: "That is a row." },
      { text: "One type of information about that record (e.g. Country, Product, or Revenue).", explanation: "Slide 1 defines a column as one specific type of information about the record." },
      { text: "The title of a dashboard visual.", explanation: "Columns are the vertical fields of a data table." }
    ]
  },
  {
    prompt: "What is the 5-step data analysis workflow taught in class?",
    points: 2,
    correct: 0,
    options: [
      { text: "Collect → Clean → Analyze → Visualize → Decide", explanation: "Slide 2 outlines the standard 5-step workflow ending in 'Decide'." },
      { text: "Code → Publish → Advertise → Monetize → Automate", explanation: "Incorrect order and software-focused." },
      { text: "Design → Color → Animate → Export → Print", explanation: "Incorrect." },
      { text: "Import → Delete → Guess → Format → Finish", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "According to the class slides, why is data analysis used across diverse industries (healthcare, sports, retail, government)?",
    points: 2,
    correct: 3,
    options: [
      { text: "Because government laws mandate spreadsheets for every company.", explanation: "Not the reason." },
      { text: "Because manual human intuition is always 100% accurate without numbers.", explanation: "Data analysis replaces guesswork with verifiable facts." },
      { text: "Only retail companies are allowed to analyze sales transactions.", explanation: "Data analysis is applied universally across all sectors." },
      { text: "Any place that generates numbers and needs better decisions is a place for data analysis.", explanation: "Slide 3 highlights: 'Any place that generates numbers and needs better decisions — that is a place for data analysis.'" }
    ]
  },

  // --- Section 2: Metrics vs Dimensions ---
  {
    prompt: "What is a 'Dimension' in data analysis?",
    points: 2,
    correct: 1,
    options: [
      { text: "A mathematical calculation that sums numbers.", explanation: "That is a metric." },
      { text: "A word or label that describes or groups something (Country, Product, Category), answering 'By what?'.", explanation: "Slide 1 and 22 define a Dimension as a label used to group/slice metrics, answering 'By what?'." },
      { text: "The physical width of your computer monitor.", explanation: "Incorrect context." },
      { text: "A currency symbol placed in front of money.", explanation: "Formatting is not a dimension." }
    ]
  },
  {
    prompt: "What is a 'Metric' in data analysis?",
    points: 2,
    correct: 0,
    options: [
      { text: "A number we calculate, count, sum, or average (e.g. Revenue, Units Sold, Profit), answering 'How much / How many?'.", explanation: "Slide 1 & 22 define a metric as a numerical calculation answering 'How much / How many?'." },
      { text: "The name of a country or sales representative.", explanation: "Those are dimensions." },
      { text: "The color theme applied to a dashboard header.", explanation: "That is visual styling." },
      { text: "A drop-down filter menu in Excel.", explanation: "That is a slicer." }
    ]
  },
  {
    prompt: "In the list below, which column is a Dimension?",
    points: 2,
    correct: 2,
    options: [
      { text: "Total Revenue ($)", explanation: "Revenue is a metric (number)." },
      { text: "Units Sold", explanation: "Units Sold is a metric (number)." },
      { text: "Product Name", explanation: "Product Name is a text label/group, making it a dimension." },
      { text: "Cost of Goods Sold", explanation: "Cost is a metric (number)." }
    ]
  },
  {
    prompt: "In the list below, which column is a Metric?",
    points: 2,
    correct: 1,
    options: [
      { text: "Customer Country", explanation: "Country is a dimension." },
      { text: "Total Profit ($)", explanation: "Profit is a calculated numerical value, making it a metric." },
      { text: "Payment Method", explanation: "Payment method is a dimension." },
      { text: "Transaction Category", explanation: "Category is a dimension." }
    ]
  },
  {
    prompt: "When you analyze 'Revenue by Country', which is the metric and which is the dimension?",
    points: 2,
    correct: 0,
    options: [
      { text: "Metric = Revenue; Dimension = Country", explanation: "Revenue is the calculated number (metric); Country is the breakdown group (dimension)." },
      { text: "Metric = Country; Dimension = Revenue", explanation: "Inverted: Country is a category, not a calculated number." },
      { text: "Both are metrics.", explanation: "Country cannot be summed or averaged." },
      { text: "Both are dimensions.", explanation: "Revenue is a measurable dollar amount." }
    ]
  },

  // --- Section 3: Proper Chart Naming Rules ---
  {
    prompt: "What is the mandatory chart naming rule taught in class?",
    points: 2,
    correct: 1,
    options: [
      { text: "Dimension by Metric", explanation: "Inverted rule. Never start with the category." },
      { text: "Metric by Dimension", explanation: "Slide 24 and 30 explicitly state the rule: [Metric] by [Dimension]. Always start with the number!" },
      { text: "Chart 1, Chart 2, Chart 3", explanation: "Generic names fail to communicate business questions." },
      { text: "Color by Size", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "Why do we always start chart titles with the Metric rather than the Dimension?",
    points: 2,
    correct: 2,
    options: [
      { text: "Because Excel crashes if you type Country first.", explanation: "Excel does not care about grammar." },
      { text: "It is an arbitrary rule with no reason.", explanation: "It exists for clarity." },
      { text: "Because executives want to know the number/result first before knowing how it is broken down.", explanation: "Slide 30 explains: 'We always start with the number, not the category.'" },
      { text: "To make chart titles as long as possible.", explanation: "Titles should remain concise." }
    ]
  },
  {
    prompt: "Which of the following chart titles strictly follows the Metric by Dimension rule?",
    points: 2,
    correct: 0,
    options: [
      { text: "Profit by Product", explanation: "Profit (Metric) by Product (Dimension) follows the exact rule." },
      { text: "Country by Revenue", explanation: "Incorrect order (starts with dimension)." },
      { text: "Sales Overview in Africa", explanation: "Vague; does not name metric and dimension explicitly." },
      { text: "Products with Profitability", explanation: "Does not follow the standard naming syntax." }
    ]
  },
  {
    prompt: "When a chart contains TWO dimensions (e.g. Country and Product), what is the correct naming syntax?",
    points: 2,
    correct: 3,
    options: [
      { text: "Country and Product for Money", explanation: "Non-standard." },
      { text: "Dimension by Metric and Dimension", explanation: "Inverted." },
      { text: "Two Dimensions by Metric", explanation: "Incorrect." },
      { text: "Metric by Dimension and Dimension (e.g. Revenue by Country and Product)", explanation: "Slide 25 states: When there are two categories, mention both: Metric by Dimension and Dimension." }
    ]
  },

  // --- Section 4: What is a Dashboard & Layout ---
  {
    prompt: "What is a Dashboard according to class definitions?",
    points: 2,
    correct: 1,
    options: [
      { text: "A 50-page printed PDF document with raw transaction rows.", explanation: "Dashboards are single-page visual summaries, not raw dumps." },
      { text: "A single screen/page that displays key business metrics and insights at a glance for decision-makers.", explanation: "Slide 4: 'A dashboard is a single page that shows important business information at a glance.'" },
      { text: "A real-time camera feed of an office warehouse.", explanation: "Incorrect." },
      { text: "An Excel formula that converts text to uppercase.", explanation: "That is a function." }
    ]
  },
  {
    prompt: "What is the Golden Rule: 'One Chart, One Question'?",
    points: 2,
    correct: 0,
    options: [
      { text: "Each visual on your dashboard should clearly answer one specific business question.", explanation: "Slide 28: 'One Chart, One Question. Each chart should answer one business question.'" },
      { text: "You can only ask your instructor one question per week.", explanation: "Humorous, but incorrect." },
      { text: "Every chart must be a 3D pie chart.", explanation: "3D charts are anti-patterns." },
      { text: "You must only have 1 single chart on the entire dashboard.", explanation: "Dashboards usually have 4-5 focused charts." }
    ]
  },
  {
    prompt: "What is the recommended 3-tier layout for a professional dashboard?",
    points: 2,
    correct: 2,
    options: [
      { text: "Charts at the top, Raw tables in the middle, KPIs at the bottom.", explanation: "KPIs should never be hidden at the bottom." },
      { text: "Slicers in the center, KPIs on the right, Charts hidden in tabs.", explanation: "Poor visual hierarchy." },
      { text: "1. KPIs at the top → 2. Charts in the middle → 3. Slicers/Filters on the side/top.", explanation: "Slide 29 outlines: 1. KPIs at the top, 2. Charts in the middle, 3. Filters (slicers) on the side." },
      { text: "Random placement of visuals with decorative clip art.", explanation: "Violates design principles." }
    ]
  },
  {
    prompt: "Where is the most valuable visual real-estate on a dashboard where users look first?",
    points: 2,
    correct: 0,
    options: [
      { text: "The top-left corner.", explanation: "Dashboard design guide (p. 11): In Western reading patterns, the eye is drawn to the top-left corner first." },
      { text: "The bottom-right corner.", explanation: "Bottom-right is the least prominent area." },
      { text: "The spreadsheet scrollbar.", explanation: "Incorrect." },
      { text: "Behind a slicer menu.", explanation: "Incorrect." }
    ]
  },

  // --- Section 5: KPIs and Formulas ---
  {
    prompt: "What does 'KPI' stand for?",
    points: 2,
    correct: 1,
    options: [
      { text: "Key Project Initiative", explanation: "Incorrect." },
      { text: "Key Performance Indicator", explanation: "KPI stands for Key Performance Indicator." },
      { text: "Knowledge Processing Interface", explanation: "Incorrect." },
      { text: "Kernel Power Indicator", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "What fundamental question does a KPI answer for executives?",
    points: 2,
    correct: 2,
    options: [
      { text: "Who wrote the Excel macro?", explanation: "Irrelevant." },
      { text: "What font color is prettiest?", explanation: "Irrelevant." },
      { text: "'Are we doing well or not?'", explanation: "Slide 19 explicitly states: 'KPIs answer the question: Are we doing well or not?'" },
      { text: "How many lines of code are in the workbook?", explanation: "Irrelevant." }
    ]
  },
  {
    prompt: "What is the primary visual difference between a KPI card and a Chart?",
    points: 2,
    correct: 0,
    options: [
      { text: "KPIs show high-level totals as big numbers; charts show breakdowns and comparisons.", explanation: "Slide 27 contrasts: KPIs show totals as big numbers; Charts show breakdowns and explanations." },
      { text: "KPIs are only for marketing; charts are only for finance.", explanation: "Both are used universally." },
      { text: "KPIs use words; charts only use numbers.", explanation: "KPIs are numbers; charts combine labels and numbers." },
      { text: "KPIs can only be viewed on mobile phones.", explanation: "KPIs are standard on all dashboards." }
    ]
  },
  {
    prompt: "What is the universal formula connecting Revenue, Cost, and Profit?",
    points: 2,
    correct: 1,
    options: [
      { text: "Revenue + Cost = Profit", explanation: "Adding costs to revenue does not calculate profit." },
      { text: "Revenue − Cost = Profit", explanation: "Slide 31: 'The one formula that explains every number: Revenue - Cost = Profit'." },
      { text: "Cost ÷ Revenue = Profit", explanation: "Cost / Revenue is cost percentage, not profit." },
      { text: "Profit × Revenue = Cost", explanation: "Mathematically incorrect." }
    ]
  },
  {
    prompt: "How is Profit Margin (%) calculated?",
    points: 2,
    correct: 2,
    options: [
      { text: "Total Revenue ÷ Total Profit", explanation: "Inverted formula." },
      { text: "Total Cost ÷ Total Revenue", explanation: "That calculates Cost Ratio, not Profit Margin." },
      { text: "Total Profit ÷ Total Revenue", explanation: "Slide 34: Profit Margin (%) = Total Profit ÷ Total Revenue." },
      { text: "Total Units Sold ÷ Total Cost", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "Why should you NEVER average individual percentage cells across pivot table rows?",
    points: 2,
    correct: 0,
    options: [
      { text: "Because averaging percentages distorts the weight of transaction volumes; you must compute total profit divided by total revenue.", explanation: "Averaging percentages treats small transactions with equal weight to million-dollar deals, causing mathematical error." },
      { text: "Because Excel automatically crashes when averaging percentages.", explanation: "Excel will calculate it, but the mathematical result is wrong." },
      { text: "Because percentages can only be added together.", explanation: "Adding percentages is also wrong." },
      { text: "Because Profit Margin cannot be shown on a dashboard.", explanation: "Profit margin is a standard KPI." }
    ]
  },
  {
    prompt: "What are the 4 core KPIs selected for the AfriMart Retail Dashboard in class?",
    points: 2,
    correct: 3,
    options: [
      { text: "Store Count, Employee Count, Electricity Bill, Stock Losses", explanation: "Not present in the dataset." },
      { text: "Discount %, Refund Rate, Delivery Days, Customer Age", explanation: "Not present in the dataset." },
      { text: "Country Count, Product Count, Minimum Price, Date Range", explanation: "These are metadata, not business KPIs." },
      { text: "Total Revenue, Total Profit, Total Units Sold, Profit Margin (%)", explanation: "Slide 34 specifies these exact 4 KPIs for the AfriMart dashboard." }
    ]
  },

  // --- Section 6: AfriMart Dataset Specifics ---
  {
    prompt: "How many total sales transaction rows exist in the AfriMart class dataset?",
    points: 2,
    correct: 1,
    options: [
      { text: "50 rows", explanation: "Too small." },
      { text: "700 rows", explanation: "Slide 31 confirms the dataset structure has 700 transaction rows." },
      { text: "50,000 rows", explanation: "The class dataset specifically contains 700 verified rows across 3 years." },
      { text: "1,000,000 rows", explanation: "Too large." }
    ]
  },
  {
    prompt: "How many African countries are represented in the AfriMart sales operations?",
    points: 2,
    correct: 0,
    options: [
      { text: "10 countries", explanation: "Slide 31 confirms operations across 10 African countries." },
      { text: "3 countries", explanation: "Incorrect." },
      { text: "54 countries", explanation: "AfriMart operates in 10 selected regional markets." },
      { text: "25 countries", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "Which of the following is NOT one of the 10 AfriMart countries in the dataset?",
    points: 2,
    correct: 2,
    options: [
      { text: "Nigeria", explanation: "Nigeria is in the dataset." },
      { text: "Côte d'Ivoire", explanation: "Côte d'Ivoire is in the dataset." },
      { text: "Germany", explanation: "Germany is a European nation; AfriMart operates strictly in African markets." },
      { text: "Tanzania", explanation: "Tanzania is in the dataset." }
    ]
  },
  {
    prompt: "How many everyday retail products are sold by AfriMart across the dataset?",
    points: 2,
    correct: 1,
    options: [
      { text: "2 products", explanation: "Too few." },
      { text: "7 products", explanation: "Slide 31 lists the 7 retail products sold." },
      { text: "100 products", explanation: "Incorrect." },
      { text: "15 products", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "Which list correctly enumerates the 7 products in the AfriMart dataset?",
    points: 2,
    correct: 0,
    options: [
      { text: "Rice, Palm Oil, Detergent, Bread, Garri, Cement, and Mobile Data Bundles", explanation: "Slide 31 explicitly lists these 7 retail goods." },
      { text: "Laptops, Smartphones, Tablets, Smartwatches, TVs, Cameras, Headphones", explanation: "AfriMart sells staple retail goods, not consumer electronics." },
      { text: "Apples, Oranges, Bananas, Grapes, Pineapples, Mangoes, Watermelons", explanation: "Incorrect." },
      { text: "Crude Oil, Gold, Diamonds, Cocoa, Timber, Rubber, Copper", explanation: "These are raw commodities, not AfriMart retail items." }
    ]
  },
  {
    prompt: "What time span is covered by the transaction dates in the AfriMart dataset?",
    points: 2,
    correct: 3,
    options: [
      { text: "1990 to 1999 (10 years)", explanation: "Incorrect historical period." },
      { text: "One single week in July 2026", explanation: "Incorrect." },
      { text: "January 2020 to December 2021", explanation: "Incorrect." },
      { text: "January 2024 to December 2026 (3 years)", explanation: "Slide 31 confirms transactions span Jan 2024 to Dec 2026." }
    ]
  },
  {
    prompt: "What does 'transaction-level data' mean in the context of the AfriMart dataset?",
    points: 2,
    correct: 0,
    options: [
      { text: "Nothing is pre-summarized; each row is an individual sale with units, revenue, cost, and date.", explanation: "Slide 31: 'This is called transaction-level data: nothing is pre-summarized. Every chart or KPI you build is just these rows added up in different ways.'" },
      { text: "The dataset only contains secret bank routing numbers.", explanation: "Incorrect." },
      { text: "The dataset has already been condensed into a single total row.", explanation: "That would be aggregated data, not transaction-level." },
      { text: "It is encrypted and cannot be viewed in Excel.", explanation: "It is a standard Excel workbook." }
    ]
  },

  // --- Section 7: Chart Selection & Visual Analytics ---
  {
    prompt: "Which chart type is best suited for comparing revenue across categories (e.g. comparing countries)?",
    points: 2,
    correct: 1,
    options: [
      { text: "Scatter plot with 500 dots", explanation: "Scatter plots test correlations, not categorical rankings." },
      { text: "Column chart or Bar chart", explanation: "Slide 26: Bar/column charts are best for comparing categories like countries or products." },
      { text: "Radar chart", explanation: "Radar charts are difficult to interpret." },
      { text: "Gauge chart", explanation: "Gauge charts only show a single percentage." }
    ]
  },
  {
    prompt: "Which chart type is best suited for showing trends over time (e.g. monthly revenue performance)?",
    points: 2,
    correct: 2,
    options: [
      { text: "Pie chart with 36 slices", explanation: "A pie chart with 36 slices is completely unreadable." },
      { text: "Treemap", explanation: "Treemaps show hierarchical part-to-whole, not time trends." },
      { text: "Line chart", explanation: "Slide 26: Line charts are the standard choice for displaying trends over continuous time." },
      { text: "Funnel chart", explanation: "Funnel charts track pipeline stages, not time trends." }
    ]
  },
  {
    prompt: "Why should analysts generally avoid Pie Charts and Donut Charts on executive dashboards?",
    points: 2,
    correct: 0,
    options: [
      { text: "Human eyes struggle to accurately judge relative angles and spatial slice areas compared to length in bar charts.", explanation: "Design guide (p. 8): 'In general, people aren't very good at comparing and contrasting spatial area. Pie charts are rarely the best choice.'" },
      { text: "Pie charts use more computer memory than bar charts.", explanation: "Memory usage is irrelevant." },
      { text: "Because pie charts cannot be printed in black and white.", explanation: "Not the core design reason." },
      { text: "Pie charts are only allowed in government census reports.", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "When is a Pie Chart acceptable to use?",
    points: 2,
    correct: 3,
    options: [
      { text: "Whenever you have more than 20 categories.", explanation: "Pie charts with many slices are unreadable." },
      { text: "To show sales trends over a 5-year period.", explanation: "Line charts show trends over time, not pie charts." },
      { text: "To replace all bar charts on a dashboard.", explanation: "Anti-pattern." },
      { text: "Only when showing parts of a whole with very few categories (e.g. 2–3 categories totaling 100%).", explanation: "Slide 26: 'Avoid pie charts unless showing parts of a whole (with few slices).'" }
    ]
  },

  // --- Section 8: Dashboard Design Principles & Edward Tufte ---
  {
    prompt: "What is the 'Data-Ink Ratio', a term coined by statistician Edward Tufte?",
    points: 2,
    correct: 1,
    options: [
      { text: "The physical weight of printer toner per ream of paper.", explanation: "Tufte's principle applies to information design, not printing logistics." },
      { text: "The proportion of visual elements that actually communicate data vs decorative non-data noise that should be eliminated.", explanation: "Design guide (p. 6): Data-ink is ink that communicates data; dashboards aim to reduce non-data ink (unnecessary gridlines, borders, backgrounds)." },
      { text: "A measure of how fast Excel can recalculate formulas.", explanation: "Formula execution time is irrelevant." },
      { text: "The number of colors used in an infographic.", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "Which of the following is considered 'non-data ink' that should be minimized or removed?",
    points: 2,
    correct: 2,
    options: [
      { text: "The height of a sales bar in a chart.", explanation: "Bar height communicates the data." },
      { text: "The KPI total revenue figure.", explanation: "The KPI number communicates data." },
      { text: "Heavy dark grid lines, 3D shadow bevels, and decorative background clipart.", explanation: "Design guide (p. 6): Heavy gridlines, 3D effects, and decorative graphics create visual noise without conveying information." },
      { text: "The axis category labels.", explanation: "Labels are required for context." }
    ]
  },
  {
    prompt: "Why should you round large numbers on an executive dashboard (e.g. showing '$1.4M' instead of '$1,421,832.47')?",
    points: 2,
    correct: 0,
    options: [
      { text: "Being overly precise clutters the screen and distracts decision-makers from seeing macro trends.", explanation: "Design guide (p. 7): 'Round your numbers. Being overly precise can get in the way of important changes.'" },
      { text: "Because Excel cannot store decimal points.", explanation: "Excel handles floating point precision easily." },
      { text: "Because cents are illegal on executive summaries.", explanation: "Not illegal, just distracting." },
      { text: "To make numbers look smaller than they really are.", explanation: "Rounding maintains true scale." }
    ]
  },
  {
    prompt: "What does it mean to 'Give your numbers context' on a dashboard?",
    points: 2,
    correct: 1,
    options: [
      { text: "Writing a 10-paragraph essay under every number.", explanation: "Too long for a dashboard." },
      { text: "Providing comparison benchmarks (e.g. prior year, targets, or averages) so viewers know if a number is good or bad.", explanation: "Design guide (p. 12): Context means helping viewers know if a metric is good, bad, or unusual by comparing against targets or past periods." },
      { text: "Translating numbers into multiple foreign languages.", explanation: "Incorrect." },
      { text: "Changing the font to Comic Sans.", explanation: "Design anti-pattern." }
    ]
  },
  {
    prompt: "What is a major dashboard design mistake mentioned in the class slides?",
    points: 2,
    correct: 3,
    options: [
      { text: "Having clear titles for every chart.", explanation: "Clear titles are best practice." },
      { text: "Placing big KPI summary cards at the top.", explanation: "Placing KPIs at top is recommended." },
      { text: "Sorting bar charts descending by value.", explanation: "Sorting makes charts easy to read." },
      { text: "Using too many charts, too many clashing colors, and omitting clear titles.", explanation: "Slide 28: 'Common dashboard mistakes: Too many charts, too many colors, no clear titles, no KPIs.'" }
    ]
  },

  // --- Section 9: Excel Pivot Tables & Slicers ---
  {
    prompt: "In Microsoft Excel, what tool is used to quickly summarize transaction-level rows into aggregations without writing complex manual formulas?",
    points: 2,
    correct: 0,
    options: [
      { text: "Pivot Tables", explanation: "Pivot tables allow drag-and-drop grouping, summing, and filtering of tabular data." },
      { text: "Paint Brush tool", explanation: "Formatting only." },
      { text: "Spell Check", explanation: "Spelling only." },
      { text: "WordArt", explanation: "Decorative only." }
    ]
  },
  {
    prompt: "To create a chart showing 'Revenue by Country' using an Excel Pivot Table, where should you place the fields?",
    points: 2,
    correct: 1,
    options: [
      { text: "Country in Filters; Revenue in Rows", explanation: "This would not break down revenue across countries." },
      { text: "Country in Rows; Revenue (Sum) in Values", explanation: "Placing Country in Rows and Revenue in Values creates the exact summary required." },
      { text: "Country in Values; Revenue in Columns", explanation: "Country is text and would only produce a count." },
      { text: "Both fields in the Filter box", explanation: "Produces no visual table." }
    ]
  },
  {
    prompt: "What is an Excel 'Slicer' and why is it added to dashboards?",
    points: 2,
    correct: 2,
    options: [
      { text: "A tool to permanently delete rows from the original dataset.", explanation: "Slicers filter views; they never delete data." },
      { text: "A formula that divides numbers by two.", explanation: "Division is not a slicer." },
      { text: "An interactive on-screen button filter that lets users filter multiple pivot charts with one click.", explanation: "Slide 34: Slicers allow dynamic filtering of dashboard visuals by Country, Product, or Year." },
      { text: "A chart animation that spins in 3D.", explanation: "Incorrect." }
    ]
  },
  {
    prompt: "To show 'Top 5 Products by Profit' in Excel, what should an analyst do?",
    points: 2,
    correct: 0,
    options: [
      { text: "Sort the pivot table descending by Profit and apply a Top 10 / Top 5 filter.", explanation: "Slide 34: 'Rows = Product, Values = Profit, Sort descending, Top 5 filter.'" },
      { text: "Delete all products except the top 5 from the raw dataset.", explanation: "Never alter raw data destructively." },
      { text: "Type the names of 5 products into an empty cell.", explanation: "Hard-coding is non-dynamic." },
      { text: "Hide the entire worksheet.", explanation: "Incorrect." }
    ]
  },

  // --- Section 10: GitHub Portfolio Documentation ---
  {
    prompt: "Why do employers and hiring managers care about seeing data analysis projects documented on GitHub?",
    points: 2,
    correct: 1,
    options: [
      { text: "Employers only care about university diplomas, not real project repositories.", explanation: "Employers heavily value public proof-of-work portfolios." },
      { text: "GitHub provides verifiable proof of practical skills, project structure, documentation quality, and communication ability.", explanation: "GitHub Guide (p. 1): 'Employers use GitHub to see proof of skills, project structure, documentation quality, and communication ability.'" },
      { text: "GitHub automatically pays students money when they upload a file.", explanation: "GitHub is a portfolio hosting service, not a payment provider." },
      { text: "To check how many social media followers a student has.", explanation: "Irrelevant." }
    ]
  },
  {
    prompt: "According to the class GitHub guide, what repository name should students use for Week 1?",
    points: 2,
    correct: 3,
    options: [
      { text: "my-test-project-123", explanation: "Unprofessional." },
      { text: "Homework_Excel", explanation: "Too generic." },
      { text: "repo1", explanation: "Poor naming." },
      { text: "Afrimart-KollyBright-Sales-Dashboard", explanation: "GitHub Guide (p. 1, section 4): 'Repository Naming Example: Afrimart-KollyBright-Sales-Dashboard'." }
    ]
  },
  {
    prompt: "In Markdown syntax for a GitHub README.md, how do you correctly embed a project dashboard screenshot?",
    points: 2,
    correct: 0,
    options: [
      { text: "![Dashboard Preview](image_name.png)", explanation: "README Cheat Sheet (p. 1): '![Text](image.png) - Insert an image.'" },
      { text: "<show image='image.png'>", explanation: "Not standard markdown image syntax." },
      { text: "Click here to download image.png", explanation: "A link is not an embedded image preview." },
      { text: "@image.png:view", explanation: "Incorrect syntax." }
    ]
  },
  {
    prompt: "What is the recommended Markdown heading level for section titles (e.g. 'Project Overview', 'Key KPIs') in a README?",
    points: 2,
    correct: 2,
    options: [
      { text: "####### Heading 7", explanation: "Markdown only supports up to 6 heading levels." },
      { text: "Plain text with no formatting", explanation: "Headings structure the document hierarchy." },
      { text: "## Heading 2", explanation: "README Cheat Sheet: '# Heading 1 for main title, ## Heading 2 for section headings'." },
      { text: "ALL CAPS BOLD ITALIC IN RED", explanation: "Markdown headings use # symbols." }
    ]
  },
  {
    prompt: "What is the primary takeaway message for builders completing this project portfolio?",
    points: 2,
    correct: 1,
    options: [
      { text: "You must build 100 charts on one sheet to impress companies.", explanation: "Quality and clarity always beat volume." },
      { text: "Consistency and clear documentation matter more than perfection; GitHub is your public proof-of-work portfolio.", explanation: "GitHub Guide (p. 2): 'Every project should be documented on GitHub. GitHub is not just storage — it is your public portfolio. Consistency matters more than perfection.'" },
      { text: "Never share your work with anyone publicly.", explanation: "Portfolios must be public to be reviewed." },
      { text: "Data analysis is only about learning formulas without understanding business decisions.", explanation: "Data analysis is ultimately about driving decisions." }
    ]
  }
];

async function seed() {
  try {
    console.log(`Clearing existing questions for assess-w1 to ensure a clean 50-question suite...`);
    
    // Fetch existing question IDs
    const existingQ = await sql`SELECT id FROM "question" WHERE "assessmentId" = 'assess-w1';`;
    const qIds = existingQ.map(q => q.id);

    if (qIds.length > 0) {
      await sql`DELETE FROM "option" WHERE "questionId" IN ${sql(qIds)};`;
      await sql`DELETE FROM "question" WHERE "assessmentId" = 'assess-w1';`;
    }

    console.log(`Inserting 50 verified class questions into Supabase...`);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = `q1-${i + 1}`;
      const correctOptId = `opt-q1-${i + 1}-${String.fromCharCode(97 + q.correct)}`;

      // 1. Insert Question
      await sql`
        INSERT INTO "question" ("id", "assessmentId", "orderNumber", "prompt", "correctOptionId", "points")
        VALUES (${qId}, 'assess-w1', ${i + 1}, ${q.prompt}, ${correctOptId}, ${q.points});
      `;

      // 2. Insert 4 Options
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        const optId = `opt-q1-${i + 1}-${String.fromCharCode(97 + j)}`;
        await sql`
          INSERT INTO "option" ("id", "questionId", "text", "explanation")
          VALUES (${optId}, ${qId}, ${opt.text}, ${opt.explanation});
        `;
      }
    }

    console.log(`Successfully seeded all ${questions.length} questions into assess-w1!`);
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('Seeding 50 questions failed:', err);
    await sql.end();
    process.exit(1);
  }
}

seed();

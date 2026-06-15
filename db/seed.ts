import { getDb } from "../server/queries/connection";
import {
  brandProfiles,
  customers,
  products,
  orders,
  segments,
  segmentCustomers,
} from "./schema";
import { eq } from "drizzle-orm";

const FIRST_NAMES = [
  "Aarav", "Aditi", "Akshay", "Amrita", "Ananya", "Arjun", "Asha", "Avani",
  "Bhavya", "Chaitanya", "Deepa", "Dev", "Diya", "Esha", "Gaurav", "Isha",
  "Jaya", "Kabir", "Kavya", "Kiran", "Krishna", "Lakshmi", "Manoj", "Maya",
  "Meera", "Mohit", "Neha", "Nikita", "Nisha", "Pallavi", "Pooja", "Priya",
  "Rahul", "Raja", "Rakesh", "Rani", "Rekha", "Rohan", "Sahil", "Sneha",
  "Sonia", "Sunita", "Suresh", "Swati", "Tanvi", "Varun", "Vijay", "Vikram",
  "Aisha", "Farhan", "Zara", "Imran", "Sana", "Adnan", "Nadia", "Tariq",
  "Leela", "Naveen", "Preeti", "Rajesh", "Sarika", "Vivek", "Anil", "Bharat",
  "Chetan", "Dinesh", "Fatima", "Gopal", "Harsh", "Indira", "Jayant", "Kamal",
  "Lalita", "Madhav", "Nalini", "Omar", "Padma", "Qadir", "Rashmi", "Shalini",
  "Tara", "Uma", "Vasant", "Yogesh", "Aarti", "Binita", "Chandra", "Dhruv",
  "Ekta", "Firoz", "Geeta", "Hemant", "Irfan", "Jyoti", "Kunal", "Lata",
  "Mukesh", "Niranjan", "Om", "Pankaj", "Ramesh", "Shivani", "Trisha",
  "Anika", "Rehan", "Simran", "Yusuf", "Ayesha", "Niharika", "Parth",
  "Ritika", "Shyam", "Tanya", "Utkarsh", "Veer", "Waseem", "Xavier", "Zubin",
  "Advait", "Bhavna", "Charu", "Daksh", "Eshita", "Faisal", "Gayatri", "Hina",
  "Ishan", "Juhi", "Kartik", "Lavanya", "Mihir", "Naina", "Omkar", "Prachi",
  "Rishabh", "Sakshi", "Tejas", "Vidya", "Adarsh", "Bimal", "Chirag", "Divya",
  "Eknath", "Gautam", "Harish", "Ila", "Jagdish", "Kalpana", "Lokesh", "Mrunal",
  "Nandini", "Ojas", "Piyush", "Radhika", "Samar", "Tulsi", "Urmila", "Vinay",
  "Yash", "Zoya", "Arnav", "Bhavesh", "Chitra", "Deven", "Ela", "Girish",
  "Hansa", "Inder", "Janhavi", "Kirti", "Luv", "Malini", "Nakul",
  "Pranav", "Ria", "Soham", "Tisha", "Uday", "Vrinda", "Abhishek", "Bhaskar",
  "Chanchal", "Darshan", "Elina", "Gagan", "Harsha", "Ishaan", "Jatin", "Kashish",
  "Laboni", "Mansi", "Nishant", "Onkar", "Prerna", "Rudra", "Sanya", "Tushar",
  "Upasana", "Vaishali", "Ajay", "Bina", "Chinu", "Dolly", "Eshan", "Gauri",
  "Hardik", "Ina", "Jagat", "Komal", "Lily", "Mona", "Neelam", "Ovi",
  "Pratik", "Ritu", "Shankar", "Urvashi", "Veerendra", "Ashok", "Babita",
  "Chetna", "Dhanraj", "Eva", "Ghanshyam", "Heena", "Ishita", "Jyotsna", "Kamlesh",
  "Lal", "Malti", "Naresh", "Obaid", "Pushpa", "Ragini", "Sohan", "Tejal",
  "Usha", "Vicky", "Asif", "Bindu", "Chhaya", "Dilip", "Eram", "Govind",
  "Hema", "Ira", "Jeet", "Kusum", "Madhu", "Nagma", "Oscar", "Prabha",
  "Roshan", "Shobha", "Tarun", "Vandana", "Zahid", "Alok", "Bandana", "Chandan",
  "Damini", "Farida", "Gulshan", "Habib", "Indu", "Jasmin", "Kanchan", "Lalit",
  "Mamta", "Naved", "Purnima", "Salman", "Taslima", "Vimal", "Zara",
  "Amir", "Barkha", "Chameli", "Dolly2", "Falguni", "Gaurav2", "Hamid", "Iram",
  "Javed", "Komal2", "Lata2", "Mehboob", "Nargis", "Obaid2", "Parveen", "Rafiq",
  "Shabnam", "Tabassum", "Umar", "Wahid", "Zeenat", "Anwar", "Bano", "Chand2",
  "Dawood", "Ehsan", "Firdaus", "Ghazala", "Hasan", "Ismail", "Jahan", "Khurshid",
  "Lubna", "Mahmood", "Naseem", "Qasim", "Rizwana", "Sabeena", "Tahir", "Yasmin",
  "Afzal", "Bushra", "Dilshad", "Feroz", "Ghaus", "Haleema", "Inayat", "Jalal",
  "Kausar", "Mumtaz", "Noor", "Qayyum", "Rukhsar", "Shahnaz", "Tanveer", "Zubair",
  "Aqeel", "Bilquis", "Durriya", "Faizan", "Gulzar", "Hameeda", "Ilyas", "Jameela",
  "Khalida", "Mushtaq", "Nazir", "Rashida", "Shaukat", "Tariq", "Viqar", "Zahida",
  "Abrar", "Badrun", "Ehtesham", "Fakhr", "Hidayat", "Ikram", "Jamshed", "Khursheed",
  "Liyakat", "Moin", "Nawab", "Raees", "Shafiq", "Tauseef", "Wajid", "Zulekha",
  "Azam", "Bashir", "Ejaz", "Fateh", "Ghulam", "Haider", "Intezar", "Jaffer",
  "Kareem", "Latif", "Majid", "Nazeer", "Qadir2", "Rais", "Sajid", "Waris",
  "Aalam", "Basit", "Dastagir", "Fida", "Hakim", "Irfan2", "Jamaal", "Khalil",
  "Mazhar", "Nadeem", "Qais", "Rashid", "Saif", "Talib", "Wasi", "Zafar",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Reddy", "Nair", "Iyer",
  "Joshi", "Patel", "Desai", "Mehta", "Shah", "Kapoor", "Malhotra", "Banerjee",
  "Chatterjee", "Mukherjee", "Agarwal", "Bhat", "Rao", "Menon", "Pillai", "Krishnan",
  "Murthy", "Hegde", "Kulkarni", "Deshpande", "Chavan", "Pawar", "Naik", "More",
  "Jadhav", "Sawant", "Gaikwad", "Kamble", "Lokhande", "Salunkhe", "Patil", "Bhosale",
  "Shinde", "Gore", "Karande", "Phadke", "Rane", "Tendulkar", "Gavaskar", "Bedi",
  "Khanna", "Chopra", "Arora", "Bajaj", "Chawla", "Dalal", "Gandhi", "Grover",
  "Handa", "Jain", "Kohli", "Luthra", "Madan", "Nagpal", "Oberoi", "Puri",
  "Qureshi", "Rajput", "Saxena", "Talwar", "Uberoi", "Vohra", "Walia", "Yadav",
  "Anand", "Bose", "Chandra", "Dutta", "Engineer", "Fernandes", "Gill", "Hussain",
  "Issac", "John", "Kaur", "Lal", "Mathew", "Narayan", "Oommen", "Pandey",
  "Rathore", "Sengupta", "Thomas", "Unnikrishnan", "Varma", "Wagh", "Xavier", "Zachariah",
  "Ansari", "Bakshi", "Chauhan", "Dhar", "Easwaran", "Farooqui", "Gokhale", "Hazra",
  "Iqbal", "Jha", "Kini", "Lobo", "Mahajan", "Nambiar", "Owais", "Prasad",
  "Rastogi", "Shetty", "Trivedi", "Upadhyay", "Venkataraman", "Waman", "Yogi", "Zutshi",
  "Acharya", "Bhatt", "Chakraborty", "Deol", "Eswaran", "Fadnis", "Ganguly", "Haldar",
  "Inamdar", "Jaiteley", "Kashyap", "Lahiri", "Majumdar", "Nanda", "Ojha", "Prabhu",
  "Raghavan", "Sarin", "Thakur", "Uppal", "Venkatesh", "Wankhede", "Ahmed", "Bachchan",
  "Chopra2", "Dixit", "Emmanuel", "Fernandez", "Grewal", "Hashmi", "Irani", "Jaitley",
  "Kohli2", "Lamba", "Madhavan", "Nigam", "Oberoi2", "Pannu", "Rampal", "Seth",
  "Tagore", "Urmila2", "Vidya2", "Warsi", "Abbas", "Balakrishnan", "Chiranjeevi", "Dhanush",
  "Ekta2", "Fahadh", "Gautham", "Harikrishnan", "Indrajith", "Jayaram", "Karthika", "Lissy",
  "Mammootty", "Nazriya", "Oduvil", "Prithviraj", "Quartet", "Revathi", "Sathyan", "Thilakan",
  "Urvashi2", "Vineeth", "Waheeda", "Ashraf", "Basu", "Chawla2", "Dutta2", "Elahi",
  "Farooq", "Ghouse", "Hasan2", "Imam", "Jaleel", "Kabir2", "Lari", "Mazhar2",
  "Nazir2", "Osman2", "Parvez", "Qazi", "Rizvi", "Saeed", "Tabassum2", "Usman",
  "Wahid2", "Yasin", "Zakir", "Alam", "Bukhari", "Chishti", "Dar", "Ehsan2",
  "Firdausi", "Ghazali", "Hamid2", "Ishaq", "Jalali", "Kader", "Lashkar", "Mahdavi",
  "Naim", "Qadri", "Rahmani", "Siddiqui", "Tanvir2", "Wajid2", "Yahya", "Zaman",
  "Akram", "Bari", "Dawood", "Feroze", "Ghani", "Hafiz", "Idris", "Javed2",
  "Kazmi", "Latif2", "Mahmud", "Naqvi", "Qureshi2", "Rashid2", "Suleiman", "Tahir2",
  "Wasim", "Younis", "Zubair2", "Anwar2", "Aziz", "Baqri", "Dildar", "Fazal",
  "Hameed", "Inam", "Jahan2", "Kamal2", "Majeed", "Nasir2", "Rafiq2", "Saleem",
  "Talat", "Wazir", "Zafar2", "Ahmad2", "Bilal", "Danish", "Faheem", "Habib2",
  "Israr", "Jamil2", "Kausar2", "Mumtaz2", "Nawaz", "Qasim2", "Rauf", "Shafiq2",
  "Tariq2", "Yaqub", "Zahoor",
];

const PRODUCT_DATA = [
  { name: "Monsoon Malabar", category: "Single Origin", price: "450.00", description: "A bold, full-bodied coffee with earthy notes and a distinctive smoky finish. Grown in the misty hills of Chikmagalur during monsoon season.", story: "Named after the unique monsooning process where beans are exposed to moist winds, swelling them to a pale gold.", sku: "BC-SO-001" },
  { name: "Bloom Signature Blend", category: "Blend", price: "380.00", description: "Our house blend combining beans from Karnataka, Kerala, and Tamil Nadu. Chocolatey, nutty, with a hint of caramel sweetness.", story: "Created after 47 iterations to find the perfect balance. This is the cup that built Bloom.", sku: "BC-BL-001" },
  { name: "French Press", category: "Equipment", price: "1850.00", description: "Borosilicate glass French press with a precision-mesh filter. 600ml capacity.", story: "Sourced from a family-owned manufacturer in Gujarat who has been making glassware for three generations.", sku: "BC-EQ-001" },
  { name: "Monsooned AA Roast", category: "Single Origin", price: "520.00", description: "Our premium reserve. AA-grade Arabica from Baba Budan Giri. Complex notes of dark chocolate, tobacco, and dried fruit.", story: "Limited to 50 bags per month from a single estate.", sku: "BC-SO-002" },
  { name: "Bloom Cold Brew Kit", category: "Equipment", price: "1200.00", description: "Everything you need for perfect cold brew: 1L mason jar, stainless steel filter, and 250g cold brew blend.", story: "Born from Bangalore's love for cold coffee.", sku: "BC-EQ-002" },
  { name: "AeroPress Go", category: "Equipment", price: "3200.00", description: "The portable coffee maker for the discerning traveller. Includes mug, lid, and 350 micro-filters.", story: "Our founder carries this on every sourcing trip.", sku: "BC-EQ-003" },
  { name: "Bloom Gift Box", category: "Gift", price: "1200.00", description: "A curated gift box with two 100g coffee pouches, a ceramic cup, and a handwritten note.", story: "Our most-gifted item. Each box is assembled by hand.", sku: "BC-GF-001" },
];

const PERSONAS = ["office_regular", "weekend_enthusiast", "gift_buyer", "subscription_loyalist", "lapsed_explorer", "new"] as const;
const CHANNELS = ["whatsapp", "sms", "email"] as const;
const ORDER_CHANNELS = ["online", "in_store", "subscription"] as const;

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function weightedRandom(weights: number[], rng: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = rng() * total;
  for (let i = 0; i < weights.length; i++) { random -= weights[i]; if (random <= 0) return i; }
  return weights.length - 1;
}

async function seed() {
  const db = getDb();
  console.log("Starting Bloom Coffee Co. seed...");

  await db.delete(segmentCustomers);
  await db.delete(segments);
  await db.delete(orders);
  await db.delete(customers);
  await db.delete(products);
  await db.delete(brandProfiles);
  console.log("  Cleared existing data");

  await db.insert(brandProfiles).values({
    name: "Bloom Coffee Co.",
    tagline: "Where Every Cup Tells a Story",
    originStory: "Founded in 2019 in a garage in Koramangala, Bangalore, Bloom Coffee Co. began as two friends obsessed with finding the perfect roast. Today, we source single-origin beans from family estates across Karnataka and Kerala, roasting in small batches to bring out the unique character of each origin.",
    toneOfVoice: "Warm, slightly poetic, never corporate, never pushy. We speak like a friend who happens to know a lot about coffee.",
    visualIdentity: JSON.stringify({ palette: { primary: "#5C3D2E", secondary: "#F5E6D0", accent: "#C75B39", success: "#6B7F3A", warning: "#D4A03A", error: "#B5422A", background: "#FAF6F1", surface: "#FFFFFF", textPrimary: "#2B2118", textSecondary: "#8B7355" }, fonts: { headline: "Playfair Display", body: "Inter" } }),
    contactInfo: JSON.stringify({ email: "hello@bloomcoffee.co", phone: "+91-80-4123-7890", address: "12th Main Road, Koramangala 4th Block, Bangalore - 560034", instagram: "@bloomcoffee.co" }),
  });
  console.log("  Inserted brand profile");

  await db.insert(products).values(PRODUCT_DATA);
  console.log("  Inserted 7 products");

  const rng = seededRandom(42);
  const customerData = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < 500; i++) {
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
    if (usedEmails.has(email)) email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}${Math.floor(rng()*100)}@gmail.com`;
    usedEmails.add(email);

    const personaRoll = rng();
    let persona;
    if (personaRoll < 0.15) persona = "new";
    else if (personaRoll < 0.35) persona = "lapsed_explorer";
    else if (personaRoll < 0.50) persona = "gift_buyer";
    else if (personaRoll < 0.70) persona = "weekend_enthusiast";
    else if (personaRoll < 0.88) persona = "office_regular";
    else persona = "subscription_loyalist";

    let healthScore;
    switch (persona) {
      case "subscription_loyalist": healthScore = 75 + Math.floor(rng() * 25); break;
      case "office_regular": healthScore = 60 + Math.floor(rng() * 30); break;
      case "weekend_enthusiast": healthScore = 50 + Math.floor(rng() * 35); break;
      case "gift_buyer": healthScore = 40 + Math.floor(rng() * 30); break;
      case "lapsed_explorer": healthScore = 10 + Math.floor(rng() * 30); break;
      default: healthScore = 50 + Math.floor(rng() * 20);
    }

    const daysAgo = Math.floor(rng() * 180);
    const lastOrderAt = new Date(Date.now() - daysAgo * 86400000);
    const firstOrderDays = 30 + Math.floor(rng() * 300);
    const firstOrderAt = new Date(lastOrderAt.getTime() - firstOrderDays * 86400000);

    customerData.push({
      name, email,
      phone: `+919${String(Math.floor(rng() * 1000000000)).padStart(9, "0")}`,
      channelPreference: CHANNELS[Math.floor(rng() * 3)],
      persona,
      totalOrders: 0, totalSpent: "0.00",
      lastOrderAt, firstOrderAt,
      healthScore,
      metadata: JSON.stringify({ personaLabel: persona.replace(/_/g, " "), discoveryChannel: ORDER_CHANNELS[Math.floor(rng() * 3)] }),
    });
  }

  await db.insert(customers).values(customerData);
  console.log("  Inserted 500 customers");

  const allCustomers = await db.select().from(customers);
  const hourWeights = [1,1,1,1,2,5,8,15,18,12,8,7,6,5,4,5,6,8,12,15,14,10,6,3];
  const orderData = [];

  for (let i = 0; i < 2000; i++) {
    const customer = allCustomers[Math.floor(rng() * allCustomers.length)];
    const maxDays = Math.floor((Date.now() - customer.firstOrderAt!.getTime()) / 86400000);
    const randomDays = Math.floor(rng() * Math.max(1, maxDays));
    const baseDate = new Date(Date.now() - randomDays * 86400000);
    baseDate.setHours(weightedRandom(hourWeights, rng), Math.floor(rng() * 60), Math.floor(rng() * 60));

    const numProducts = 1 + Math.floor(rng() * 3);
    const selectedProducts = [];
    const productItems = [];
    let totalAmount = 0;

    for (let p = 0; p < numProducts; p++) {
      const prodIdx = Math.floor(rng() * PRODUCT_DATA.length);
      if (selectedProducts.includes(prodIdx)) continue;
      selectedProducts.push(prodIdx);
      const qty = 1 + Math.floor(rng() * 2);
      const price = parseFloat(PRODUCT_DATA[prodIdx].price);
      totalAmount += price * qty;
      productItems.push({ productId: prodIdx + 1, productName: PRODUCT_DATA[prodIdx].name, quantity: qty, unitPrice: PRODUCT_DATA[prodIdx].price, total: (price * qty).toFixed(2) });
    }

    orderData.push({
      customerId: customer.id,
      orderNumber: `ORD${String(i + 1).padStart(6, "0")}`,
      totalAmount: totalAmount.toFixed(2),
      status: rng() < 0.95 ? "completed" : rng() < 0.8 ? "pending" : "cancelled",
      channel: ORDER_CHANNELS[Math.floor(rng() * 3)],
      items: JSON.stringify(productItems),
      createdAt: baseDate,
    });
  }

  orderData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Insert in very small batches
  for (let i = 0; i < orderData.length; i += 5) {
    const batch = orderData.slice(i, i + 5);
    await db.insert(orders).values(batch);
  }
  console.log("  Inserted 2,000 orders");

  // Update customer aggregates
  for (const customer of allCustomers) {
    const custOrders = orderData.filter(o => o.customerId === customer.id && o.status === "completed");
    const totalOrders = custOrders.length;
    const totalSpent = custOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const lastOrder = custOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    await db.update(customers).set({ totalOrders, totalSpent: totalSpent.toFixed(2), lastOrderAt: lastOrder?.createdAt ?? null, firstOrderAt: customer.firstOrderAt }).where(eq(customers.id, customer.id));
  }
  console.log("  Updated customer aggregates");

  // Create pre-built segments
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

  const lapsedCustomers = allCustomers.filter(c => c.lastOrderAt && c.lastOrderAt < sixtyDaysAgo && c.totalOrders > 1);
  if (lapsedCustomers.length > 0) {
    const seg = await db.insert(segments).values({ name: "Lapsed Customers (60+ days)", description: "Customers who used to order regularly but haven't purchased in over 60 days", aiReasoning: `${lapsedCustomers.length} customers spent ${(lapsedCustomers.reduce((s, c) => s + parseFloat(c.totalSpent), 0) / lapsedCustomers.length).toFixed(0)} on average but haven't returned in 60+ days.`, customerCount: lapsedCustomers.length, isAiSuggested: 1, source: "ai_suggested", filterJson: JSON.stringify({ lastOrderBefore: sixtyDaysAgo.toISOString(), minTotalOrders: 2 }) }).returning({ id: segments.id });
    const segId = Number(seg[0].id);
    await db.insert(segmentCustomers).values(lapsedCustomers.map(c => ({ segmentId: segId, customerId: c.id })));
    console.log(`  Created 'Lapsed Customers' segment (${lapsedCustomers.length} customers)`);
  }

  const hvCustomers = allCustomers.filter(c => parseFloat(c.totalSpent) > 2000);
  if (hvCustomers.length > 0) {
    const seg = await db.insert(segments).values({ name: "High-Value Customers", description: "Customers with lifetime spend over Rs.2,000", aiReasoning: `${hvCustomers.length} customers have spent over Rs.2,000 with Bloom. They deserve personalized attention.`, customerCount: hvCustomers.length, isAiSuggested: 1, source: "ai_suggested", filterJson: JSON.stringify({ minTotalSpent: 2000 }) }).returning({ id: segments.id });
    const segId = Number(seg[0].id);
    await db.insert(segmentCustomers).values(hvCustomers.map(c => ({ segmentId: segId, customerId: c.id })));
    console.log(`  Created 'High-Value Customers' segment (${hvCustomers.length} customers)`);
  }

  const weCustomers = allCustomers.filter(c => c.persona === "weekend_enthusiast" && parseFloat(c.totalSpent) > 500);
  if (weCustomers.length > 0) {
    const seg = await db.insert(segments).values({ name: "Weekend Enthusiasts", description: "Weekend buyers who spend on premium single-origin coffees", aiReasoning: `${weCustomers.length} customers consistently buy on weekends, favoring single-origin selections.`, customerCount: weCustomers.length, isAiSuggested: 1, source: "ai_suggested", filterJson: JSON.stringify({ persona: "weekend_enthusiast", minTotalSpent: 500 }) }).returning({ id: segments.id });
    const segId = Number(seg[0].id);
    await db.insert(segmentCustomers).values(weCustomers.map(c => ({ segmentId: segId, customerId: c.id })));
    console.log(`  Created 'Weekend Enthusiasts' segment (${weCustomers.length} customers)`);
  }

  const newCustomers = allCustomers.filter(c => c.firstOrderAt && c.firstOrderAt > fourteenDaysAgo);
  if (newCustomers.length > 0) {
    const seg = await db.insert(segments).values({ name: "New Customers (Last 14 Days)", description: "Recently acquired customers who need nurturing", aiReasoning: `${newCustomers.length} new customers joined in the last two weeks.`, customerCount: newCustomers.length, isAiSuggested: 1, source: "ai_suggested", filterJson: JSON.stringify({ firstOrderAfter: fourteenDaysAgo.toISOString() }) }).returning({ id: segments.id });
    const segId = Number(seg[0].id);
    await db.insert(segmentCustomers).values(newCustomers.map(c => ({ segmentId: segId, customerId: c.id })));
    console.log(`  Created 'New Customers' segment (${newCustomers.length} customers)`);
  }

  const loyalCustomers = allCustomers.filter(c => c.persona === "subscription_loyalist" && parseFloat(c.totalSpent) > 1500);
  if (loyalCustomers.length > 0) {
    const seg = await db.insert(segments).values({ name: "Subscription Loyalists", description: "Our most committed subscribers with highest lifetime value", aiReasoning: `${loyalCustomers.length} subscription customers represent the backbone of Bloom's revenue.`, customerCount: loyalCustomers.length, isAiSuggested: 1, source: "ai_suggested", filterJson: JSON.stringify({ persona: "subscription_loyalist", minTotalSpent: 1500 }) }).returning({ id: segments.id });
    const segId = Number(seg[0].id);
    await db.insert(segmentCustomers).values(loyalCustomers.map(c => ({ segmentId: segId, customerId: c.id })));
    console.log(`  Created 'Subscription Loyalists' segment (${loyalCustomers.length} customers)`);
  }

  const totalRevenue = orderData.filter(o => o.status === "completed").reduce((s, o) => s + parseFloat(o.totalAmount), 0);
  console.log("\nSeed Summary:");
  console.log(`  Brand: Bloom Coffee Co.`);
  console.log(`  Customers: 500`);
  console.log(`  Orders: 2,000`);
  console.log(`  Products: 7`);
  console.log(`  Segments: 5 (AI-suggested)`);
  console.log(`  Total Revenue: Rs.${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`);
  console.log("\nBloom Coffee Co. world is ready!");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });

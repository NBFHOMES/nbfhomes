/**
 * Review Templates for NBF Homes
 * Thousands of unique combinations to ensure a human feel and prevent repetition.
 */

const openings = [
    "I was looking for a room for weeks and finally found NBF Homes.",
    "Easily the best platform for genuine listings in the city.",
    "Direct owner contact is what makes this site better than others.",
    "Zero brokerage is a real blessing for students like me.",
    "Finding a flat in a new city is hard, but this made it easy.",
    "Highly impressed with the verified property details here.",
    "Smooth and transparent experience from start to finish.",
    "Finally, a site that actually shows what's available without brokers.",
    "Very reliable service for those looking to rent without hassle.",
    "A great initiative for the local community in Mandsaur and nearby.",
    "I've tried many apps, but NBF Homes is the most straightforward.",
    "The best part about this platform is the lack of middlemen.",
    "Great job on making property search so affordable and easy.",
    "Verified listings really make a difference while searching from outside.",
    "Searching for a PG was never this easy before NBF Homes.",
    "Initially I was worried about brokerage, but NBF saved my day.",
    "Best experience so far in finding a rental home in this area.",
    "If you want to save money and time, use NBF Homes.",
    "Direct contact with owners made the whole process faster.",
    "The listings here are much more realistic than other websites.",
    "Perfect for anyone who hates dealing with pushy brokers.",
    "I found my current flat within 24 hours of using this platform.",
    "So happy to see a dedicated portal for our local cities.",
    "Everything from photos to location was 100% accurate.",
    "Highly recommended for bachelors moving to a new city.",
    "Transparent pricing and genuine house owners, what else do you need?",
    "A one-stop solution for all rental needs in the region.",
    "Very helpful for people who are new to Mandsaur or Neemuch.",
    "The search interface is very smooth and easy to use.",
    "Finally, a platform that understands the struggle of finding a PG."
];

const features = [
    "The way we can connect directly with owners",
    "The range of verified PG and shared flat options",
    "Searching for homes without any hidden brokerage",
    "The detailed property images and location info",
    "The simplicity of the property search filters",
    "Accessing owner contacts instantly without paying extra",
    "Finding genuine rooms in Tier 1-4 cities so easily",
    "The fact that all listings are verified and genuine",
    "The direct messaging and WhatsApp support",
    "How fast the property owners respond to inquiries",
    "The transparency in pricing and property rules",
    "The localized search results for city specific areas",
    "The maps integration that shows exact locations",
    "The variety of choices from single rooms to full flats",
    "The clean UI that makes browsing very pleasant",
    "The specific details about electricity and water status",
    "How easy it is to filter by tenant preferences",
    "Finding properties in exactly the neighborhood I wanted",
    "The direct call feature that saves so much time",
    "The detailed descriptions provided for every house",
    "The latest listings that are updated almost daily",
    "The fraud prevention warnings that keep us safe",
    "The shared room options that are great for students",
    "The flexibility in finding both short and long term stays",
    "Every little detail like security deposit info being clear",
    "Getting notified about new properties in my preferred city",
    "The ability to share properties directly via WhatsApp",
    "How well the site works on mobile browsers too",
    "The focus on student-friendly and affordable housing",
    "The direct link to property owners for quick visits"
];

const vibes = [
    "was a complete game-changer for me.",
    "was surprisingly simple and fast.",
    "made my home hunting experience stress-free.",
    "saved me a lot of time and money.",
    "is exactly what I was looking for.",
    "is better than any other portal I've used.",
    "worked like magic for my urgent requirement.",
    "is highly recommended for anyone moving here.",
    "is the most transparent way to find a rental.",
    "surpassed all my expectations.",
    "is a breath of fresh air in the real estate market.",
    "is genuinely helpful for students and professionals.",
    "helped me find a place within just two days.",
    "is the only platform I trust for rentals now.",
    "is doing a great job at removing broker nuisance.",
    "is a lifesaver for people on a tight budget.",
    "is the most efficient way to browse local rooms.",
    "has made my relocation process very smooth.",
    "is a must-use for anyone tired of fake ads.",
    "is surprisingly transparent for a rental site.",
    "exceeded what I expected from a local startup.",
    "is clearly the market leader in this region.",
    "makes finding a room feel like online shopping.",
    "is the fastest way to get in touch with owners.",
    "truly solves the brokerage problem once and for all.",
    "provides the most accurate data for every listing.",
    "is very user-friendly and highly intuitive.",
    "helped me find a verified PG without any stress.",
    "is the gold standard for no-brokerage platforms.",
    "completely changed my view on property hunting."
];

const closers = [
    "Keep up the great work!",
    "Highly recommended to everyone!",
    "Best platform in the city, hands down.",
    "Must try for both owners and tenants.",
    "Great experience overall. Five stars!",
    "Will definitely use this again in the future.",
    "Finally, a portal that cares about the user.",
    "A must-have for students and bachelors.",
    "Very helpful team and genuine service.",
    "Loving the brokerage-free experience!",
    "Highly satisfied with the overall process.",
    "Check it out if you want to save on brokerage.",
    "Great service for those new to the city.",
    "Excellent initiative by the NBF team.",
    "Thank you for this wonderful platform!",
    "I've recommended this to all my friends.",
    "Best of luck to the team for future growth.",
    "Really happy with my new room, thanks NBF!",
    "Looking forward to more listings in future.",
    "A big thank you for saving my brokerage money.",
    "If you're house hunting, start here first.",
    "Zero complaints, only praise for this site.",
    "The best thing to happen to the local rental market.",
    "Glad I found this before paying any broker.",
    "Simple, fast, and free of middle-men.",
    "Five stars for the transparency and ease.",
    "A game-changer for the real estate industry.",
    "So glad to have a broker-free portal like this.",
    "Value for money and time, absolutely loved it.",
    "Total peace of mind while searching for a home!"
];

export const generateHumanReview = () => {
    // Huge combinatorial space: 30 * 30 * 30 * 30 = 810,000 unique strings
    const op = openings[Math.floor(Math.random() * openings.length)];
    const ft = features[Math.floor(Math.random() * features.length)];
    const vi = vibes[Math.floor(Math.random() * vibes.length)];
    const cl = closers[Math.floor(Math.random() * closers.length)];
    
    // Varying sentence structures for more natural feel
    const structures = [
        `${op} ${ft} ${vi} ${cl}`,
        `${ft} ${vi} ${op} ${cl}`,
        `${op} ${cl} ${ft} ${vi}`,
        `${ft} on NBF Homes ${vi} ${cl}`,
        `${op} Overall, ${ft} ${vi} ${cl}`
    ];
    
    return structures[Math.floor(Math.random() * structures.length)];
};

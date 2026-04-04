/*
    data.js - Sample data for Taft Eats application
    This file contains sample users, restaurants, and reviews to populate the application for testing and demonstration purposes.
    Note: Created on 2026-02-01 by Ronin P. Zerna, Joshua Benedict B. Co, Don Oswin D. Campos, and Martin Carlos R. Delos Reyes, with the assistance of AI tools (ChatGPT).
*/

// Sample Users
const users = [
    {
        username: "ronin_z",
        fullName: "Rownin P. Zerna",
        avatar: "../assets/images/sample-user1.jpg",
        description: "Loves trying out new tacos and burritos.",
        joinedDate: "2025-12-01",
        likedRestaurants: [],
        dislikedRestaurants: [],
        password: "ronin123"
    },
    {
        username: "joshua_c",
        fullName: "Joshua Benedict B. Co",
        avatar: "../assets/images/sample-user2.jpg",
        description: "Enjoys coffee shops and exploring new eateries.",
        joinedDate: "2025-11-20",
        likedRestaurants: [],
        dislikedRestaurants: [],
        password: "joshua123"
    },
    {
        username: "don_c",
        fullName: "Don Oswin D. Campos",
        avatar: "../assets/images/sample-user3.jpg",
        description: "Big fan of street food and quick bites.",
        joinedDate: "2025-10-15",
        likedRestaurants: [],
        dislikedRestaurants: [],
        password: "don123"
    },
    {
        username: "martin_r",
        fullName: "Martin Carlos R. Delos Reyes",
        avatar: "../assets/images/sample-user4.jpg",
        description: "Enjoys seafood and group dining experiences.",
        joinedDate: "2025-12-10",
        likedRestaurants: [],
        dislikedRestaurants: [],
        password: "martin123"   
    },
    {
        username: "ryan_v",
        fullName: "Ryan T. Villanueva",
        avatar: "../assets/images/sample-user5.jpg",
        description: "Loves affordable meals and casual dining.",
        joinedDate: "2025-09-05",
        likedRestaurants: [],
        dislikedRestaurants: [],
        password: "ryan123"
    },
    {
        username: "emily_s",
        fullName: "Emily S. Santos",
        avatar: "../assets/images/sample-user6.jpg",
        description: "Passionate about desserts and trendy cafes.",
        joinedDate: "2025-11-25",
        likedRestaurants: [],
        dislikedRestaurants: [],
        password: "emily123"
    },
    {
        username: "owner_latoca",
        fullName: "La Toca Official",
        avatar: "../assets/images/sample-owner1.jpg",
        description: "Official La Toca account.",
        joinedDate: "2025-01-01",
        likedRestaurants: [],
        dislikedRestaurants: [],
        role: "owner",
        establishmentId: 1,
        password: "latoca123"
    },
    {
        username: "owner_barn",
        fullName: "Barn Official",
        avatar: "../assets/images/sample-owner2.jpg",
        description: "Official Barn account.",
        joinedDate: "2025-01-01",
        likedRestaurants: [],
        dislikedRestaurants: [],
        role: "owner",
        establishmentId: 2,
        password: "barn123"
    },
    {
        username: "owner_tinuhog",
        fullName: "Tinuhog ni Benny's Official",
        avatar: "../assets/images/sample-owner3.jpg",
        description: "Official Tinuhog ni Benny's account.",
        joinedDate: "2025-01-01",
        likedRestaurants: [],
        dislikedRestaurants: [],
        role: "owner",
        establishmentId: 3,
        password: "tinuhog123"
    },
    {
        username: "owner_century",
        fullName: "Century Seafood Official",
        avatar: "../assets/images/sample-owner4.jpg",
        description: "Official Century Seafood account.",
        joinedDate: "2025-01-01",
        likedRestaurants: [],
        dislikedRestaurants: [],
        role: "owner",
        establishmentId: 4,
        password: "century123"
    },
    {
        username: "owner_24chicken",
        fullName: "24 Chicken Official",
        avatar: "../assets/images/sample-owner5.jpg",
        description: "Official 24 Chicken account.",
        joinedDate: "2025-01-01",
        likedRestaurants: [],
        dislikedRestaurants: [],
        role: "owner",
        establishmentId: 5,
        password: "24chicken123"
    },
    {
        username: "owner_agno",
        fullName: "Agno Food Court Official",
        avatar: "../assets/images/sample-owner6.jpg",
        description: "Official Agno Food Court account.",
        joinedDate: "2025-01-01",
        likedRestaurants: [],
        dislikedRestaurants: [],
        role: "owner",
        establishmentId: 6,
        password: "agno123"
    }
];

// Sample Restaurants
const establishments = [
    { id: 1, name: "La Toca", rating: 4.2, description: "A cozy Mexican-inspired restaurant along Taft Avenue known for its tacos and burritos.", image: "../assets/images/sample-owner1.jpg" },
    { id: 2, name: "Barn", rating: 4.0, description: "Popular student hangout offering affordable rice meals and milk tea." , image: "../assets/images/sample-owner2.jpg"},
    { id: 3, name: "Tinuhog ni Benny's", rating: 4.6, description: "Famous for grilled Filipino street food favorites served fresh daily.", image: "../assets/images/sample-owner3.jpg" },
    { id: 4, name: "Century Seafood", rating: 3.8, description: "Casual seafood dining offering group meals and budget-friendly platters.", image: "../assets/images/sample-owner4.jpg" },
    { id: 5, name: "24 Chicken", rating: 4.8, description: "Very affordable fried chicken joint with a variety of flavors." , image: "../assets/images/sample-owner5.jpg"},
    { id: 6, name: "Agno Food Court", rating: 4.3, description: "A diverse food hub featuring multiple stalls serving local and international cuisine." , image: "../assets/images/sample-owner6.jpg"}
];

// Sample Reviews
const reviews = [
    // La Toca Reviews
    { id: 0, restaurantId: 1, user: users[0], rating: 5, title: "Best Tacos in Town!", body: "Absolutely loved the tacos here. The flavor is rich and the portions are just right.", media: "../assets/images/sample-food1.jpg", helpful: 12, unhelpful: 1, ownerResponse: "Thank you for the wonderful feedback! We are thrilled you enjoyed our tacos and portion sizes. We look forward to serving you again soon." },
    { id: 1, restaurantId: 1, user: users[1], rating: 4, title: "Great Burritos", body: "Burritos were delicious, but the waiting time was a bit long during lunch hours.", media: "", helpful: 8, unhelpful: 0, ownerResponse: "We are glad you loved the burritos! We appreciate your patience during busy lunch hours and are working to improve service speed." },
    { id: 2, restaurantId: 1, user: users[2], rating: 5, title: "Authentic Mexican Taste", body: "Really enjoyed the authentic Mexican taste and cozy ambiance.", media: "../assets/images/sample-food2.jpg", helpful: 10, unhelpful: 0, ownerResponse: "Muchas gracias! We are delighted you enjoyed the authentic flavors and cozy ambiance. Hope to welcome you back soon" },
    { id: 3, restaurantId: 1, user: users[3], rating: 4, title: "Good Food, Average Service", body: "The food is amazing but the service could be faster. Still worth a visit.", media: "", helpful: 6, unhelpful: 1, ownerResponse: "We are happy you loved the food and thank you for the honest feedback on service. We will continue training our team to serve faster." },
    { id: 4, restaurantId: 1, user: users[4], rating: 5, title: "Highly Recommended!", body: "Loved it! Definitely coming back with friends.", media: "", helpful: 14, unhelpful: 0, ownerResponse: "Thank you for recommending us! We are excited to have you back with friends for more tacos and burritos." },

    // Barn Reviews
    { id: 5, restaurantId: 2, user: users[1], rating: 4, title: "Affordable Meals", body: "Barn has very affordable meals and the milk tea is refreshing.", media: "", helpful: 7, unhelpful: 0, ownerResponse: "We are glad you enjoyed our affordable meals and refreshing milk tea. Thank you for dining with us!" },
    { id: 6, restaurantId: 2, user: users[2], rating: 5, title: "Student Favorite Spot", body: "Always packed but worth the wait. Great atmosphere for students.", media: "../assets/images/sample-food3.jpg", helpful: 12, unhelpful: 1, ownerResponse: "We appreciate your kind words! We are happy to be a favorite hangout and will keep working to make the wait worthwhile." },
    { id: 7, restaurantId: 2, user: users[3], rating: 4, title: "Good for quick bites", body: "Quick service and tasty meals. Perfect for lunch breaks.", media: "", helpful: 6, unhelpful: 0, ownerResponse: "Thank you! We are pleased you found our service quick and meals tasty — perfect for busy student schedules." },
    { id: 8, restaurantId: 2, user: users[4], rating: 5, title: "Highly Recommended", body: "The best spot for affordable meals. I come here every week.", media: "", helpful: 10, unhelpful: 0, ownerResponse: "We are honored to be your weekly go-to spot. Thank you for recommending us to others!" },
    { id: 9, restaurantId: 2, user: users[5], rating: 4, title: "Nice Ambiance", body: "Simple but cozy. Great for a quick meal.", media: "", helpful: 8, unhelpful: 1, ownerResponse: "We are happy you enjoyed the cozy atmosphere. We will keep making Barn a welcoming place for quick meals." },

    // Tinuhog ni Benny's Reviews
    { id: 10, restaurantId: 3, user: users[0], rating: 5, title: "Street Food Heaven", body: "Loved the variety of skewers and the sauces were perfect.", media: "", helpful: 15, unhelpful: 0, ownerResponse: "Thank you for the amazing feedback! We are glad you loved the skewers and sauces — our pride and joy." },
    { id: 11, restaurantId: 3, user: users[1], rating: 4, title: "Tasty Skewers", body: "The skewers are cooked perfectly, but the place is a bit crowded.", media: "", helpful: 9, unhelpful: 1, ownerResponse: "We are delighted you enjoyed the skewers! We will continue working on improving seating and crowd management." },
    { id: 12, restaurantId: 3, user: users[2], rating: 5, title: "Quick and Delicious", body: "Fast service and the food was hot and fresh.", media: "", helpful: 12, unhelpful: 0, ownerResponse: "We are happy you appreciated the fast service and freshly cooked food. Thank you for visiting!" },
    { id: 13, restaurantId: 3, user: users[3], rating: 4, title: "Great Value", body: "Affordable and tasty. The sauces are a standout.", media: "../assets/images/sample-food4.jpg", helpful: 8, unhelpful: 0, ownerResponse: "We are glad you found our food affordable and flavorful. Our sauces are indeed customer favorites!" },
    { id: 14, restaurantId: 3, user: users[5], rating: 5, title: "A Must-Try!", body: "Definitely one of the best street food spots in the area.", media: "", helpful: 14, unhelpful: 0, ownerResponse:"Thank you for the review! We are honored to be considered one of the best street food spots around." },

    // Century Seafood Reviews
    { id: 15, restaurantId: 4, user: users[0], rating: 3, title: "Average Seafood", body: "The seafood is fresh, but the flavoring could be better.", media: "", helpful: 5, unhelpful: 2, ownerResponse: "Thank you for the honest feedback. We will continue improving our flavoring while keeping seafood fresh and affordable" },
    { id: 16, restaurantId: 4, user: users[1], rating: 4, title: "Good Group Meals", body: "Perfect place for large groups. Meals are shareable and affordable.", media: "", helpful: 7, unhelpful: 1, ownerResponse: "We are glad you enjoyed our group platters! We love serving families and friends who dine together." },
    { id: 17, restaurantId: 4, user: users[2], rating: 3, title: "Decent Dining", body: "The place is casual and good for a quick seafood fix.", media: "", helpful: 4, unhelpful: 0, ownerResponse: "We appreciate your review. We will keep working to make our casual dining experience even better." },
    { id: 18, restaurantId: 4, user: users[3], rating: 4, title: "Pleasant Experience", body: "Service was friendly and the seafood platters are filling.", media: "", helpful: 6, unhelpful: 0, ownerResponse: "Thank you for highlighting our friendly service and filling platters. We are happy you had a pleasant visit." },
    { id: 19, restaurantId: 4, user: users[4], rating: 3, title: "Okay for Budget", body: "Good prices but taste could be improved.", media: "", helpful: 3, unhelpful: 1, ownerResponse:"We are grateful for your feedback. We will keep balancing affordability with taste improvements." },

    // 24 Chicken Reviews
    { id: 20, restaurantId: 5, user: users[0], rating: 5, title: "Crispy and Delicious", body: "The fried chicken is perfectly crispy and the sauces are great.", media: "", helpful: 16, unhelpful: 0, ownerResponse: "We are thrilled you loved our crispy chicken and sauces. Thank you for the kind words!" },
    { id: 21, restaurantId: 5, user: users[2], rating: 5, title: "Best Chicken Spot", body: "Affordable and tasty. Highly recommended!", media: "", helpful: 14, unhelpful: 0, ownerResponse: "We are honored to be your top choice for chicken. Thank you for recommending us!" },
    { id: 22, restaurantId: 5, user: users[3], rating: 4, title: "Great for Quick Meals", body: "Perfect for a fast and filling meal.", media: "", helpful: 10, unhelpful: 1, ownerResponse:"We are glad you found our meals fast and filling. Perfect for busy days!" },
    { id: 23, restaurantId: 5, user: users[4], rating: 5, title: "Always Fresh", body: "The chicken is always freshly cooked and juicy.", media: "../assets/images/sample-food5.jpg", helpful: 12, unhelpful: 0, ownerResponse:"Thank you for noticing our commitment to freshness. We are happy you enjoyed the juicy chicken." },
    { id: 24, restaurantId: 5, user: users[5], rating: 5, title: "Top Quality", body: "Love the variety of flavors and consistent quality.", media: "", helpful: 11, unhelpful: 0, ownerResponse:"We are delighted you appreciate our variety of flavors and consistent quality. Thank you for your support!" },

    // Agno Food Court Reviews
    { id: 25, restaurantId: 6, user: users[1], rating: 4, title: "Lots of Choices", body: "Great variety of stalls offering both local and international dishes.", media: "", helpful: 9, unhelpful: 0, ownerResponse: "We are glad you enjoyed the variety of stalls. We aim to offer something for everyone." },
    { id: 26, restaurantId: 6, user: users[2], rating: 5, title: "Perfect Spot for Groups", body: "Everyone finds something they like. Very convenient and tasty.", media: "", helpful: 13, unhelpful: 0, ownerResponse: "Thank you! We are happy to be a convenient place where groups can enjoy different cuisines together." },
    { id: 27, restaurantId: 6, user: users[3], rating: 4, title: "Good Value", body: "Affordable prices and plenty of options.", media: "", helpful: 8, unhelpful: 1, ownerResponse:"We are pleased you found our food affordable and diverse. Thank you for dining with us." },
    { id: 28, restaurantId: 6, user: users[4], rating: 5, title: "Highly Recommend!", body: "Clean, fast, and delicious. Perfect for lunch.", media: "", helpful: 12, unhelpful: 0, ownerResponse:"We are honored by your recommendation! We will continue keeping Agno clean, fast, and delicious." },
    { id: 29, restaurantId: 6, user: users[5], rating: 4, title: "Nice Food Court", body: "Lots of seating and a variety of meals to choose from.", media: "../assets/images/sample-food6.jpg", helpful: 7, unhelpful: 0, ownerResponse:"We are happy you enjoyed the seating and variety. Thank you for visiting us!" }
];

// Only export in Node.js environment (not in browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { users, establishments, reviews };
}
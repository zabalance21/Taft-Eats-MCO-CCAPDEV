$(document).ready(function () {

    $("#nav-user-initial").click(function(e) {
        e.stopPropagation();
        $(".user-dropdown-menu").toggle();
    });

    $(document).click(function() {
        $(".user-dropdown-menu").hide();
    });

});

// =======================
// Toggle Review Expand/Collapse
// CHANGED: Previously only toggled a CSS class for line-clamp truncation.
// Now swaps between a 100-character truncated string and the full review text
// stored in the data-full-body attribute. Also truncates on page load.
// =======================
function toggleReview(btn) {
    const reviewCard = btn.closest('.review-card');
    const reviewText = reviewCard.querySelector('.main_review_p');
    const fullBody = reviewText.getAttribute('data-full-body');
    const isExpanded = reviewText.classList.toggle('expanded');

    if (isExpanded) {
        reviewText.textContent = fullBody;
        btn.textContent = 'Show Less';
    } else {
        reviewText.textContent = fullBody.length > 100 ? fullBody.substring(0, 100) + '...' : fullBody;
        btn.textContent = 'Read Full Review';
    }
}

// Truncate all review bodies to 100 characters on page load
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.main_review_p.truncated').forEach(function(el) {
        var fullBody = el.getAttribute('data-full-body');
        if (fullBody && fullBody.length > 100) {
            el.textContent = fullBody.substring(0, 100) + '...';
        }
    });
});

// =======================
// Owner Reply Form Toggle
// CHANGED: Replaced the old prompt()-based owner response with a proper
// inline form. toggleReplyForm shows/hides the reply form container
// below the review card when Write Reply or Edit Reply is clicked.
// =======================
function toggleReplyForm(btn) {
    var reviewCard = btn.closest('.review-card');
    var formContainer = reviewCard.querySelector('.reply-form-container');
    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block';
    } else {
        formContainer.style.display = 'none';
    }
}

// =======================
// Full Review Page Rendering -> now handled server-side via /review/:id route
// =======================

// =======================
// Helpful / Unhelpful Vote Buttons
// =======================
$(document).on("click", ".vote-btn", function () {
    // CHANGED: Ignore display-only vote buttons shown to signed-out users.
    if ($(this).is(":disabled")) {
        return;
    }

    const btn = $(this);
    const reviewId = btn.data("review-id");
    const type = btn.data("type");

    $.ajax({
        url: `/review/vote/${reviewId}`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ type }),
        success: function (data) {
            // Update counts in the same review card
            const container = btn.closest(".review-footer");
            container.find(".helpful-count").text(data.helpful);
            container.find(".unhelpful-count").text(data.unhelpful);

            // Toggle active states
            const helpfulBtn = container.find(".helpful-btn");
            const unhelpfulBtn = container.find(".unhelpful-btn");

            if (data.userVote === "helpful") {
                helpfulBtn.addClass("active");
                unhelpfulBtn.removeClass("active");
            } else if (data.userVote === "unhelpful") {
                unhelpfulBtn.addClass("active");
                helpfulBtn.removeClass("active");
            } else {
                helpfulBtn.removeClass("active");
                unhelpfulBtn.removeClass("active");
            }
        },
        error: function (xhr) {
            const msg = xhr.responseJSON?.error || "Something went wrong.";
            alert(msg);
        }
    });
});

// =======================
// Restaurant Like / Dislike Buttons
// CHANGED: New handler — sends the user's like/dislike vote for a restaurant
// to POST /establishments/:id/like and toggles the active class on the buttons.
// =======================
$(document).on("click", ".rest-like-btn, .rest-dislike-btn", function () {
    const btn = $(this);
    const restaurantId = btn.data("restaurant-id");
    const type = btn.data("type");

    $.ajax({
        url: `/establishments/${restaurantId}/like`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ type }),
        success: function (data) {
            $(".rest-like-btn").toggleClass("active", data.liked);
            $(".rest-dislike-btn").toggleClass("active", data.disliked);
        },
        error: function (xhr) {
            const msg = xhr.responseJSON?.error || "Something went wrong.";
            alert(msg);
        }
    });
});

// =======================
// Document Ready — Search & Filter Handlers
// =======================
$(document).ready(function() {
    // CHANGED: Previously called renderEstablishmentReviews() which was a client-side
    // function from the old static data.js approach that no longer exists.
    // Now filters the server-rendered .review-card elements by matching the search
    // term against the reviewer's name, review title, or review body text.
    $("#search-reviews").on("input", function() {
        const searchTerm = $(this).val().toLowerCase();
        $(".review-card").each(function() {
            const name = $(this).find(".review-user strong").text().toLowerCase();
            const title = $(this).find(".main_review_h").text().toLowerCase();
            const body = $(this).find(".main_review_p").attr("data-full-body")?.toLowerCase() || "";
            if (name.includes(searchTerm) || title.includes(searchTerm) || body.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});

// Render star rows on the Establishments page from each card's numeric rating.
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.est-stars').forEach(function(starRow) {
        const rawRating = parseFloat(starRow.getAttribute('data-rating'));
        if (Number.isNaN(rawRating)) {
            return;
        }

        // Round to nearest whole star to keep visual output simple and readable.
        const activeStars = Math.max(0, Math.min(5, Math.round(rawRating)));
        starRow.querySelectorAll('span').forEach(function(star, index) {
            if (index < activeStars) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    });
});

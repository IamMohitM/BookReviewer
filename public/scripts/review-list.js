let bookrating = 0;


$(document).ready(function () {
    $('.star-div').each(function (index, element) {
        starRating($(element));
    });
});

function starRating(starDiv) {
    let fillColor = 'none';

    let rating = Number(starDiv.attr("rating"));

    switch (rating) {

        case 1:
        case 2:
            fillColor = 'red';
            break;
        case 3:
            fillColor = 'orange'
            break;
        case 4:
        case 5:
            fillColor = 'green';
            break;

    }

    starDiv.children().each(function (index, element) {
        element.querySelector("svg path").setAttribute('fill', index < rating ? fillColor : "none");
    });

}

$(".star-div > button").on("click", function (event) {

    const prevButtons = $(this).prevAll("button")
    const rating = prevButtons.length + 1;

    $(this).parent().attr("rating", rating);

    starRating($(this).parent());
});


async function deleteReview(event, el) {
    const trigger = event.currentTarget;
    $.ajax({
        url: `delete/${trigger.id}`,
        type: "DELETE",
        success: function (response) {
            $(trigger).closest(".review-card").remove()
        },
        error: function (error) { console.log(error); }
    });
}

async function editReview(event, el) {
    const trigger = event.currentTarget;
    window.location.href = `/${$(trigger).attr("data-id")}`;
}
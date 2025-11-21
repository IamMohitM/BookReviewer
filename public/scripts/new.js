const HOST = "https://openlibrary.org/search.json"
const BACKEND = 'http://localhost:3000'
const responseLimit = 10;

let book_data;

function getBookList(element) {
    console.log(element.title, element.author_name);
    return `<div>
                <button class='option-button' id='${element.key}' onclick='optionSelected(event)'>
                    ${element.title} by ${element.author_name}
                </button>
            </div>`;
}

function toggleDisplays(makeVisible, makeHidden) {
    makeVisible.removeClass('d-none');
    makeHidden.addClass('d-none');
}

async function runBookSearch() {
    const entry = $("#titleId").val().replaceAll(" ", "+");
    if (entry === "" || entry === null) {
        return;
    }

    console.log(entry);
    $("body").css("cursor", "progress");
    try {
        const response = await axios.get(`${HOST}?q=${entry}&limit=${responseLimit}`);
        const option_box = $("#optionBox");
        option_box.empty();

        const ol = $("<div><div>")

        book_data = {};

        response.data.docs.forEach(element => {
            const new_el = getBookList(element);
            ol.append(new_el);
            console.log("Cover id", element.cover_i);
            //store book_data
            book_data[element.key] = {
                title: element.title,
                publish_year: element.first_publish_year,
                cover_id: element.cover_i,
                author_name: element.author_name
            }
        });

        option_box.append(ol);

    } catch (err) {
        console.log(err);
    } finally {
        $("body").css("cursor", "default");
        $(".option-box").first().removeClass('d-none');
    }
}

// runn search with search button or title enter
$("#search").on('click', runBookSearch);
$("#titleId").on("keydown", async function (event) {
    if ((event.key) === "Enter") {
        event.preventDefault();
        await runBookSearch();
    }
    // TODO: escape key should turn it into heading
})


async function optionSelected(event) {

    const header = $('#title-header');
    const titleText = $('#titleId');

    $(".option-box").first().addClass('d-none');
    titleText.val(book_data[event.target.id].title);
    header.text(book_data[event.target.id].title);
    header.attr("value", event.target.id);
    console.log(header.attr("value"));

    toggleDisplays(header, titleText);

}

$("#save-button").click(async function (event) {
    const edit = $("#reviewEdit");
    const p = $("#reviewText");

    //TODO: this may break;
    const book_id = $("#title-header").attr("value");

    const book_info = book_data[book_id];
    console.log(book_info);
    const d = {
        title: book_info.title,
        book_id: book_id,
        author: book_info.author_name.join(", "),
        cover_id: book_info.cover_id,
        publish_year: book_info.publish_year,
        rating: Number($("#ratingDiv").attr("rating")),
        review: edit.val()
    }
    console.log(d);
    try {
        const response = await axios.post(`${BACKEND}/new`, d);

        console.log(response.data);
        p.html(edit.val().replaceAll("\n", "<br>"));

        toggleDisplays(p, edit);
        $("#buttonView").addClass("d-none");

    } catch (error) {
        console.log(error);
    }
})

$("#update-button").click(async function (event){
    const id = $('body').attr("id");
    console.log(id);
    const p = $("#reviewText");
    const title_header = $("#title-header");
    const edit = $("#reviewEdit");
    try {
        const response = await axios.post(`${BACKEND}/${id}`, {
            review: edit.val(),
            title: title_header.text(),
            rating: Number($("#ratingDiv").attr("rating"))
        });
        
        p.html(edit.val().replaceAll("\n", "<br>"));

        toggleDisplays(p, edit);
        $("#buttonView").addClass("d-none");
        console.log("Response:", response);
        window.location.href = response.data.redirect_url;

    } catch (error) {
        console.log(error);
    }
});

$("#reviewText").click(async function (event) {
    toggleDisplays($("#reviewEdit"), $(this))

    $("#buttonView").removeClass("d-none");
})


$('#exit-button').on('click', function (event) {
    window.location.reload();
})

$('#title-header').on('click', function () {
    $(this).addClass('d-none');
    $("#titleId").removeClass('d-none').focus();
    $("#titleId").select();
});
import express from "express";
import pg from "pg";

const app = express();
const PORT = 3000;

//TODO: move this to env vars
const USERNAME = "postgres";
const HOST = "localhost";
const DATABASE = "BookReview";
const PASSWORD = "admin";
const DB_PORT = 5433;

const db = new pg.Client({
    user: USERNAME,
    host: HOST,
    database: DATABASE,
    password: PASSWORD,
    port: DB_PORT
})

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get("/", (req, res) => {
    res.sendFile("index.html");
})

async function getReviews() {
    try {
        const result = await db.query("select id, title, cover_id, review, rating from reviews");
        return result.rows;
    } catch (err) {
        console.log(err);
    }
    return null;
}

app.get("/reviews", async (req, res) => {
    try {
        const result = await getReviews();
        console.log("Running Reviews");
        if (result.length > 0) {
            console.log("Running Reviews and showing results");

            res.render("review-list.ejs", { reviews: result });
        } else {
            res.render("review-list.ejs");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/new", async (req, res) => {
    try {
        const result = await db.query('insert into reviews (title, review, rating, cover_id, key, author) values ($1, $2, $3, $4, $5, $6) returning *',
            [req.body.title, req.body.review, Number(req.body.rating), req.body.cover_id, req.body.book_id, req.body.author]
        );
        //TODO: should return to a new ejs
        res.send({ "returningId": result.rows[0].id });
    } catch (err) {
        console.log(err);
    }
});

app.post("/create", async (req, res) => {
    try {
        res.render('new.ejs', { mode: "create" });
    } catch (err) {
        console.log(err);
    }
})

app.get("/:id", async (req, res) => {
    const review_id = Number(req.params.id);
    try {
        const result = await db.query("select * from reviews where id=$1", [review_id]);
        const data = result.rows[0];
        res.render("new.ejs", {
            mode: "edit", id: review_id, result: {
                title: data.title,
                author: data.author,
                rating: data.rating,
                review: data.review,
                key: data.key,
                cover_id: data.cover_id,
                id: data.id
            }
        });
    } catch (err) {
        console.log(err);
    }
})

app.post("/:id", async (req, res) => {
    const review_id = Number(req.params.id);
    try {
        const result = await db.query("update reviews set title=$1, review=$2, rating=$3 where id = $4 returning *", [req.body.title, req.body.review, req.body.rating, review_id]);
        const data = result.rows[0];
        res.send({
            mode: "edit",
            redirect_url: `/${review_id}`,
            id: `${review_id}`
        });
    } catch (err) {
        console.log(err);
    }
})


app.delete("/delete/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const result = await db.query(`delete from reviews where id = $1`, [id]);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
})

process.on("SIGINT", () => {
    db.end();
    process.exit(0);
});

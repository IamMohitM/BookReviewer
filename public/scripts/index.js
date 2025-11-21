const HOST = "http://localhost";
const PORT = 3000;

$("#review-button").on("click", function (event){
    window.location.href = `${HOST}:${PORT}/reviews`;
});


$("#create-button").on("click", async function (event){
    try{
        // const result = await axios.post(`${HOST}:${PORT}/create`);
        // window.location.href = result.data,redirec
        window.location.href = `${HOST}:${PORT}/create`
    }catch(err){
        console.log(err);
    }
});
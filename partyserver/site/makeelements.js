function createplayer(newobj = {}){
    var obj = Object.assign({name:"random",role:"text here",img:"./userimg.png",likes:[],score:0},newobj)
    var lillikes = ``;
    obj.likes.forEach((element)=>{
        lillikes = lillikes+`<div class="like">${element}</div>`
    })
    var str = `<div class='player'>
    <div class='p-img'>
        <img src='${obj.img}'>
    </div>
    <div class='p-data'>
        <h2> ${obj.name} | ${obj.role}</h2>
        <div id='likecontainer' class='p-likes'>
            ${lillikes}
        </div>
    </div>
    <div class='p-notif'>
    <h3>${obj.score}</h3>
    </div>
    
    </div>
    `
    $('#players').append(
        str
    )
}
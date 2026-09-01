const wiTrailerBtnEl = document.querySelector(".wiTrailerBtn");
const wiTrailerVideoEl = document.querySelector(".videowi");
const fbBtnEl = document.querySelector(".fb");
const googleBtnEl = document.querySelector(".google");
const twitterBtnEl = document.querySelector(".twitter");

fbBtnEl.addEventListener("click", ()=>{
    window.open('https://www.facebook.com/games/','_blank');
});
googleBtnEl.addEventListener("click", ()=>{
    window.open('https://play.google.com/store/games','_blank');
});
twitterBtnEl.addEventListener("click", ()=>{
    window.open('https://twitter.com','_blank');
});
wiTrailerBtnEl.addEventListener("click", () =>{
    wiTrailerBtnEl.style.visibility = 'hidden';
    wiTrailerVideoEl.setAttribute("controls","controls");
    wiTrailerVideoEl.play();
});

wiTrailerBtnEl.addEventListener("mouseover", ()=>{
    wiTrailerBtnEl.style.backgroundImage = "url(../Images/WI_Play_H.png)";
});

wiTrailerBtnEl.addEventListener("mouseout", ()=>{
    wiTrailerBtnEl.style.backgroundImage = "url(../Images/WI_Play.png)";
});

wiTrailerVideoEl.addEventListener("pause", ()=>{

    wiTrailerBtnEl.style.visibility = 'visible';
});
wiTrailerVideoEl.addEventListener("play", ()=>{

    wiTrailerBtnEl.style.visibility = 'hidden';
});

wiTrailerVideoEl.addEventListener("ended", ()=>{

    wiTrailerBtnEl.style.visibility = 'visible';
    wiTrailerVideoEl.removeAttribute("controls");
    wiTrailerVideoEl.currentTime = 0;
});


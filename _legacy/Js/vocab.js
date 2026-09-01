const vocabTrailerBtnEl = document.querySelector(".vocabTrailerBtn");
const vocabTrailerVideoEl = document.querySelector(".videovocab");
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
vocabTrailerBtnEl.addEventListener("click", () =>{
    vocabTrailerBtnEl.style.visibility = 'hidden';
    vocabTrailerVideoEl.setAttribute("controls","controls");
    vocabTrailerVideoEl.play();
});

vocabTrailerBtnEl.addEventListener("mouseover", ()=>{
    vocabTrailerBtnEl.style.backgroundImage = "url(../Images/Vocab_Play_H.png)";
});

vocabTrailerBtnEl.addEventListener("mouseout", ()=>{
    vocabTrailerBtnEl.style.backgroundImage = "url(../Images/Vocab_Play.png)";
});

vocabTrailerVideoEl.addEventListener("pause", ()=>{

    vocabTrailerBtnEl.style.visibility = 'visible';
});
vocabTrailerVideoEl.addEventListener("play", ()=>{

    vocabTrailerBtnEl.style.visibility = 'hidden';
});

vocabTrailerVideoEl.addEventListener("ended", ()=>{

    vocabTrailerBtnEl.style.visibility = 'visible';
    vocabTrailerVideoEl.removeAttribute("controls");
    vocabTrailerVideoEl.currentTime = 0;
});


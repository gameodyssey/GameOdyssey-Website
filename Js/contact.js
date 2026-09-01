const fbBtnEl = document.querySelector(".fb");
const googleBtnEl = document.querySelector(".google");
const twitterBtnEl = document.querySelector(".twitter");

const sendBtn=document.querySelector(".sendBtn");



fbBtnEl.addEventListener("click", ()=>{
    window.open('https://www.facebook.com/games/','_blank');
});
googleBtnEl.addEventListener("click", ()=>{
    window.open('https://play.google.com/store/games','_blank');
});
twitterBtnEl.addEventListener("click", ()=>{
    window.open('https://twitter.com','_blank');
});

sendBtn.addEventListener("click", ()=>{
    
    var userEl=document.getElementById("usr");
    var emailEl=document.getElementById("email");
    var messageEl=document.getElementById("messageArea");
    var subjEl=document.getElementById("subject");
    console.log(subjEl);
    window.location.href = "mailto:info@gameodyssey.com?subject="+subjEl.value+"&body="+messageEl.value;

    messageEl.value="";
    subjEl.value="";
    userEl.value="";
    emailEl.value="";
    
})
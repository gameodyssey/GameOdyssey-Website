const nextBtnEl = document.querySelector(".next");
const prevBtnEl = document.querySelector(".previous");
const imageContainerEl = document.querySelector(".image-container");
const itemsEl = document.querySelectorAll(".item");

const videoEls = document.querySelectorAll("video");

const btnGameEls = document.querySelectorAll(".btnGame");

const fbBtnEl = document.querySelector(".fb");
const googleBtnEl = document.querySelector(".google");
const twitterBtnEl = document.querySelector(".twitter");

let currentImg = 1;
let timer = null;

//set to true if using slide
let usingTimer = false;

//age verification popup
let popup = document.getElementById("popup");


fbBtnEl.addEventListener("click", ()=>{
    window.open('https://www.facebook.com/games/','_blank');
});
googleBtnEl.addEventListener("click", ()=>{
    window.open('https://play.google.com/store/games','_blank');
});
twitterBtnEl.addEventListener("click", ()=>{
    window.open('https://twitter.com','_blank');
});


nextBtnEl.addEventListener("click", ()=>{
    currentImg++;
    resetSlide();
    updateImg();
    stopVideos();
    updateBtngames();
})

prevBtnEl.addEventListener("click", ()=>{
    currentImg--;
    resetSlide();
    updateImg();
    stopVideos();
    updateBtngames();
})

btnGameEls.forEach(btnGame => {
    btnGame.addEventListener("click",()=>{
        currentImg = parseInt(btnGame.id);
        resetSlide();
        updateImg();
        stopVideos();
        updateBtngames();
    })
});

startSlide();

function resetSlide()
{
    if(usingTimer)
    {
        clearInterval(timer);
        timer = null;
        setTimeout(startSlide, 5000);
    }
}

function startSlide()
{
    if(usingTimer)
    {
        if(timer === null)
        {
            timer = setInterval(()=>{
                currentImg++;
                updateImg();
            }, 3000);
        }
    }

}


function updateImg()
{
    if(currentImg > itemsEl.length)
    {
        currentImg = 1;
    }
    else if(currentImg < 1)
    {
        currentImg = itemsEl.length;
    }
    imageContainerEl.style.transform = `translateX(-${(currentImg - 1)*1920}px)`;
}

function updateBtngames()
{
    btnGameEls.forEach(btnGame => {
        if(parseInt(btnGame.id) === currentImg)
        {
            btnGame.style.opacity = "1";
        }
        else
        {
            btnGame.style.opacity = "0.5";
        }
    });
}

function stopVideos()
{
    videoEls.forEach(videoEl => {
        videoEl.pause();
        videoEl.currentTime=0;
    });
}

//center the trailer video if in fullscreen mode
videoEls.forEach(videoEl => {
    videoEl.addEventListener("fullscreenchange",()=>{

        if (document.fullscreenElement != null) {
            videoEl.style.paddingTop = '0px';
            videoEl.style.paddingLeft = '0px';
        } else {
            videoEl.style.paddingTop = '135px';
            videoEl.style.paddingLeft = '56%';
        }
    });
});


function openAgeVerifyPopup(){
    popup.classList.add("open-popup");
}

function closeAgeVerifyPopup(){
    popup.classList.remove("open-popup");
}

function enterImmortalUnchainedPage(){
    popup.classList.remove("open-popup");
    window.open("https://store.steampowered.com/app/369440/Immortal_Unchained/");
}

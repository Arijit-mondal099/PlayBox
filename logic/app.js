const allSongsContainer = document.querySelector(".allSongsContainer");
const leftContainer = document.querySelector(".leftContainer");
const playPauseBtn = document.querySelector(".playPause");
const songInfo = document.querySelector(".songInfo");
const songTime = document.querySelector(".songTime");
const seekBar = document.querySelector(".seekBar");
const circle = document.querySelector(".circle");
const hambar = document.querySelector(".hambar");
const closeContainer = document.querySelector(".closeContainer");
const previous = document.querySelector(".previous");
const next = document.querySelector(".next");
const playBarContainer = document.querySelector(".playBarContainer");
const volume = document.querySelector("#volume");
const playBtns = document.querySelectorAll(".playBtn");

//-------------------------------------------------------------------------------

const currentSong = new Audio(); // audio
let songs = []; // store here all songs
let folder = ""; // scelect the folder

async function getSongs(folder) {
    const songs = []; // store all songs here
    try {
        // fetch songs from songs api
        const response = await fetch(`/songsApi/songs.json`);
        const data = await response.json();
        // fetch current songs fonder
        const currFolder = data.find( songFolder => songFolder.folder === folder);
        // push all songs into songs array
        currFolder.allSongs.forEach( song => songs.push(song) );

    } catch (error) {
        console.log("Internal server error!! for fetch song", error);
    }

    return songs;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "Invalid";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const minitiesFormat = String(minutes).padStart(1, '0');
    const secondsFormat = String(remainingSeconds).padStart(1, '0');

    return `${minitiesFormat}:${secondsFormat}`;
}

// function to play the songs
function playMusic(songName, folder) {
    try {
        currentSong.src = `/songs/${folder}/${songName}.mp3`;
        currentSong.play();

        // render actual song name
        songInfo.textContent = songName;
        playPauseBtn.innerHTML = `
            <img src="../icons/pause.png" alt="img" class="songsBtn">
        `;
    } catch (error) {
        console.log("Internal server error!! for play song");
    }
}

// function to render the all songs
function renderSongs(songs) {
    allSongsContainer.innerHTML = ""; // clear previous songs
    for (const song of songs) { // add new songs
        allSongsContainer.innerHTML += `
            <div class="songsContainer flex  align-center  border-radius">
                <div class="iconContainer">
                    <img src="../icons/music.png" alt="song" class="songIcon">
                </div>
                <h3 class="songName text-m text-w">${
                    song.split("Songs/")[1].split(".mp3")[0]
                }</h3>
            </div>
        `;
    }
}

// event to the play clicked song 
function playSongs() {
    const songContainers = document.querySelectorAll(".songsContainer");
    songContainers.forEach(song => {
        song.addEventListener("click", event => {
            event.preventDefault();
            const songName = song.children[1].textContent; // fetch song name
            playBarContainer.style.display = "flex"; // play bar ko render karo
            playMusic(songName, folder); // function call for play the clicked song
        }); 
    });
}

// -------------------------------------------------------------------------------

async function main() {
    // add event to playlist card to lode songs
    playBtns.forEach(playlist => {
        playlist.addEventListener("click", async event => {
            folder = playlist.dataset.folder; // get the current folder
            songs = await getSongs(folder); // get the list of all songs 
            renderSongs(songs); // render all songs into app
            playSongs(); // attach an event listener to each song 
        })
    });

    // attach an event to play or pause songs
    playPauseBtn.addEventListener("click", event => {
        event.preventDefault();

        if (currentSong.paused) {
            currentSong.play(); // play the song
            playPauseBtn.innerHTML = `
                <img src="../icons/pause.png" alt="img" class="songsBtn">
            `;
        } else {
            currentSong.pause(); // pause the song
            playPauseBtn.innerHTML = `
                <img src="../icons/play.png" alt="img" class="songsBtn">
            `;
        }
    });

    // attach an event for time update (song duration)
    currentSong.addEventListener("timeupdate", event => {
        event.preventDefault();
        const seconds = secondsToMinutesSeconds(currentSong.currentTime);
        const minitues = secondsToMinutesSeconds(currentSong.duration);

        songTime.textContent = `${seconds}/${minitues}`;
        circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

        if (seconds === minitues) {
            playPauseBtn.innerHTML = `
                <img src="../icons/play.png" alt="img" class="songsBtn">
            `;
        }
    });

    // attach event to seekbar
    seekBar.addEventListener("click", event => {
        event.preventDefault();
        const currentWidth = (event.offsetX / event.target.getBoundingClientRect().width) * 100;
        circle.style.left = currentWidth + "%";
        currentSong.currentTime = (currentSong.duration * currentWidth) / 100;
    });

    // attach event to hambar open
    hambar.addEventListener("click", event => {
        leftContainer.style.left = 0;
    });

    // attach event to hambar close
    closeContainer.addEventListener("click", event => {
        leftContainer.style.left = "-100%";
    });

    // add event to previous and next
    previous.addEventListener("click", event => {
        // find current song index
        const currSong = "/songs/" + currentSong.src.split("songs/")[1].replaceAll("%20", " ");  
        const currentSongIndex = songs.indexOf(currSong);

        if (currentSongIndex - 1 < 0) {
            const songName = songs[songs.length - 1].split(`${folder}/`)[1].split(".mp3")[0].replaceAll("%20", " ");
            playMusic(songName, folder); // first hai toh last se stsrt karo
        }
        else {
            const songName = songs[currentSongIndex - 1].split(`${folder}/`)[1].split(".mp3")[0].replaceAll("%20", " ");
            playMusic(songName, folder); // prev karo
        }
    });

    next.addEventListener("click", event => {    
        // find current song index
        const currSong = "/songs/" + currentSong.src.split("songs/")[1].replaceAll("%20", " ");  
        const currentSongIndex = songs.indexOf(currSong);

        if ((currentSongIndex + 1) < songs.length) {
            const songName = songs[currentSongIndex + 1].split(`${folder}/`)[1].split(".mp3")[0].replaceAll("%20", " ");
            playMusic(songName, folder); // next karo
        }
        else {
            const songName = songs[0].split(`${folder}/`)[1].split(".mp3")[0].replaceAll("%20", " ");
            playMusic(songName, folder); // last hai toh first se stsrt karo
        }
    });

    // add event to volume seekbar
    volume.addEventListener("change", event => {
        event.preventDefault();
        currentSong.volume = parseInt(event.target.value) / 100;
    });
}

main();
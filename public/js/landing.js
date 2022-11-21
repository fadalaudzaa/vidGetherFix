const createButton = document.querySelector("#createroom");
const codeCont = document.querySelector('#roomcode');
const joinButton = document.querySelector('#joinroom');

//generate a random code for room id 
function uniqueID() {
    return 'xyxyx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//if the user clicks on create room button
createButton.addEventListener('click', (e) => {
    location.href = `/room.html?room=${uniqueID()}`;
});

//if user input an empty roomid
joinButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (codeCont.value.trim() == "") {
        alert("Room ID cannot be empty!");
        codeCont.classList.add('roomcode-error');
        return;
    }
    const code = codeCont.value;
    location.href = `/room.html?room=${code}`;
})

codeCont.addEventListener('change', (e) => {
    e.preventDefault();
    if (codeCont.value.trim() !== "") {
        codeCont.classList.remove('roomcode-error');
        return;
    }
})

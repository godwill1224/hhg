

//profile image preview
let profileImage = document.getElementById("profileImage");
if (profileImage) {
  profileImage.addEventListener("change", function (event) {
    const [file] = event.target.files;
    if (file) {
      document.getElementById("profileImagePreview").src =
        URL.createObjectURL(file);
    }
  });
}

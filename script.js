const dreamForm = document.getElementById('dreamForm');
const dreamList = document.getElementById('dreamList');
const addUrlBtn = document.getElementById('addUrlBtn');
const imageURLInput = document.getElementById('imageURL');

const userEmailInput = document.getElementById('userEmail');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMsg = document.getElementById('welcomeMsg');
const userDisplay = document.getElementById('userDisplay');
const loginSection = document.getElementById('loginSection');
const toggleFormBtn = document.getElementById('toggleFormBtn');

let urlImages = [];
let currentUserEmail = null;
let dreamsData = {}; // { email1: [dreams], email2: [dreams], ... }

// Toggle form visibility
toggleFormBtn.addEventListener('click', () => {
  if (!currentUserEmail) {
    alert('Please login first.');
    return;
  }
  if (dreamForm.style.display === 'none') {
    dreamForm.style.display = 'flex';
  } else {
    dreamForm.style.display = 'none';
  }
});

// Login
loginBtn.addEventListener('click', () => {
  const email = userEmailInput.value.trim().toLowerCase();
  if (!email || !validateEmail(email)) {
    alert('Please enter a valid email.');
    return;
  }
  currentUserEmail = email;
  userDisplay.textContent = currentUserEmail;
  loginSection.style.display = 'none';
  welcomeMsg.style.display = 'block';
  toggleFormBtn.style.display = 'block';
  loadDreams();
});

// Logout
logoutBtn.addEventListener('click', () => {
  currentUserEmail = null;
  dreamsData = {};
  dreamList.innerHTML = '';
  loginSection.style.display = 'block';
  welcomeMsg.style.display = 'none';
  toggleFormBtn.style.display = 'none';
  dreamForm.style.display = 'none';
  userEmailInput.value = '';
});

// Add image URL
addUrlBtn.addEventListener('click', () => {
  const url = imageURLInput.value.trim();
  if (url) {
    urlImages.push(url);
    alert('Image URL added!');
    imageURLInput.value = '';
  }
});

dreamForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUserEmail) {
    alert('Please login first.');
    return;
  }

  const title = document.getElementById('dreamTitle').value.trim();
  const files = document.getElementById('dreamImages').files;

  if (!title) {
    alert('Please enter a dream title.');
    return;
  }

  const dream = {
    id: Date.now(),
    title,
    images: [],
    completed: false,
    userPhoto: null
  };

  // Read uploaded files (promises)
  const filePromises = [];

  if (files.length > 0) {
    Array.from(files).forEach(file => {
      filePromises.push(new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      }));
    });
  }

  Promise.all(filePromises).then(results => {
    // Add uploaded images
    dream.images = dream.images.concat(results);
    // Add URL images
    dream.images = dream.images.concat(urlImages);
    urlImages = [];

    // Save dream in data and localStorage
    if (!dreamsData[currentUserEmail]) {
      dreamsData[currentUserEmail] = [];
    }
    dreamsData[currentUserEmail].push(dream);
    saveDreams();
    renderDreams();
    dreamForm.reset();
    dreamForm.style.display = 'none';
  });
});

function renderDreams() {
  dreamList.innerHTML = '';
  if (!dreamsData[currentUserEmail]) return;

  dreamsData[currentUserEmail].forEach(dream => {
    const dreamDiv = document.createElement('div');
    dreamDiv.className = 'dream';

    // Title
    const titleTag = document.createElement('h3');
    titleTag.textContent = dream.title;

    // Images container
    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'images-container';

    dream.images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      imagesContainer.appendChild(img);
    });

    dreamDiv.appendChild(titleTag);
    dreamDiv.appendChild(imagesContainer);

    if (dream.completed) {
      const completedLabel = document.createElement('div');
      completedLabel.className = 'completed-label';
      completedLabel.textContent = 'Dream Complete';
      dreamDiv.appendChild(completedLabel);

      if (dream.userPhoto) {
        const userImg = document.createElement('img');
        userImg.src = dream.userPhoto;
        userImg.className = 'user-photo';
        dreamDiv.appendChild(userImg);
      }
    } else {
      // Complete button
      const completeBtn = document.createElement('button');
      completeBtn.className = 'complete-btn';
      completeBtn.textContent = 'Mark as Complete';

      completeBtn.addEventListener('click', () => {
        markDreamComplete(dream.id);
      });

      dreamDiv.appendChild(completeBtn);
    }

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete Dream';
    deleteBtn.style.marginLeft = '10px';

    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete the dream: "${dream.title}"?`)) {
        deleteDream(dream.id);
      }
    });

    dreamDiv.appendChild(deleteBtn);

    dreamList.appendChild(dreamDiv);
  });
}

function deleteDream(id) {
  let dreams = dreamsData[currentUserEmail];
  dreamsData[currentUserEmail] = dreams.filter(d => d.id !== id);
  saveDreams();
  renderDreams();
}

function markDreamComplete(id) {
  // Find dream by id
  const dreams = dreamsData[currentUserEmail];
  const dream = dreams.find(d => d.id === id);
  if (!dream) return;

  if (dream.completed) return;

  // Show file input for user photo
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        dream.userPhoto = ev.target.result;
        dream.completed = true;
        saveDreams();
        renderDreams();
      };
      reader.readAsDataURL(file);
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  // Remove the input after use
  fileInput.addEventListener('blur', () => {
    document.body.removeChild(fileInput);
  });
}

function saveDreams() {
  localStorage.setItem('dreamsData', JSON.stringify(dreamsData));
}

function loadDreams() {
  const saved = localStorage.getItem('dreamsData');
  if (saved) {
    dreamsData = JSON.parse(saved);
  }
  renderDreams();
}

function validateEmail(email) {
  // simple email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// On page load, hide toggle form and button till login
toggleFormBtn.style.display = 'none';







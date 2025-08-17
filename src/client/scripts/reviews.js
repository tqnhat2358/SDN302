const API = 'http://localhost:9999/api/reviews';

async function loadReviews() {
  const res = await fetch(API);
  const reviews = await res.json();
  const list = document.getElementById('review-list');
  list.innerHTML = '';
  reviews.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `⭐ ${r.rating} - ${r.comment} (${r.user?.name || 'Unknown'})`;
    list.appendChild(li);
  });
}

loadReviews();

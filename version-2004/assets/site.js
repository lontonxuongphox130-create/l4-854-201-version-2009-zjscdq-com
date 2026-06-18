document.addEventListener('DOMContentLoaded',function(){
var toggle=document.querySelector('[data-menu-toggle]');
var menu=document.querySelector('[data-mobile-menu]');
if(toggle&&menu){toggle.addEventListener('click',function(){menu.classList.toggle('is-open')})}
var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
if(slides.length){var active=0;var show=function(i){active=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('is-active',n===active)});dots.forEach(function(d,n){d.classList.toggle('is-active',n===active)})};dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});setInterval(function(){show(active+1)},5200)}
var normalize=function(s){return (s||'').toString().toLowerCase()};
var filterCards=function(root,q){var cards=[].slice.call(root.querySelectorAll('[data-card]'));var term=normalize(q);var shown=0;cards.forEach(function(card){var ok=!term||normalize(card.getAttribute('data-title')).indexOf(term)>-1;card.classList.toggle('hidden-by-filter',!ok);if(ok)shown++});var empty=root.parentElement.querySelector('[data-empty]');if(empty){empty.style.display=shown?'none':'block'}};
var searchInput=document.querySelector('[data-filter-input]');
var grid=document.querySelector('[data-card-grid]');
if(searchInput&&grid){var params=new URLSearchParams(location.search);var q=params.get('q')||'';if(q){searchInput.value=q}filterCards(grid,searchInput.value);searchInput.addEventListener('input',function(){filterCards(grid,searchInput.value)})}
var sortButtons=[].slice.call(document.querySelectorAll('[data-sort]'));
if(sortButtons.length&&grid){sortButtons.forEach(function(btn){btn.addEventListener('click',function(){sortButtons.forEach(function(b){b.classList.remove('is-active')});btn.classList.add('is-active');var key=btn.getAttribute('data-sort');var cards=[].slice.call(grid.querySelectorAll('[data-card]'));cards.sort(function(a,b){if(key==='views'){return Number(b.getAttribute('data-views'))-Number(a.getAttribute('data-views'))}if(key==='year'){return normalize(b.getAttribute('data-year')).localeCompare(normalize(a.getAttribute('data-year')))}return Number(b.getAttribute('data-id'))-Number(a.getAttribute('data-id'))});cards.forEach(function(card){grid.appendChild(card)})})})}
});
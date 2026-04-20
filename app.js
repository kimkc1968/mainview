document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  lucide.createIcons();

  // 2. Initialize Leaflet Map
  // T Center on Busan Haeundae area approx as per the screenshot
  const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([35.1668, 129.1684], 15); // Haeundae Jung-dong approx

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  // Custom Rider Center Marker
  const riderIcon = L.divIcon({
    className: 'custom-rider-icon',
    html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); position: relative;">
             <div style="position: absolute; top: -14px; left: -14px; width: 44px; height: 44px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; animation: pulse 2s infinite;"></div>
             <i style="position: absolute; top: 1px; left: 1px; width: 12px; height: 12px; color: white;" data-lucide="navigation"></i>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  L.marker([35.1668, 129.1684], {icon: riderIcon}).addTo(map);
  
  // Need to re-init lucide for dynamically generated icons in leaflet
  setTimeout(() => { lucide.createIcons(); }, 100);

  // Generate Custom Price/Status Markers
  const createMapMarker = (title, price, status, colorClass) => {
    return L.divIcon({
      className: 'clear-marker',
      html: `
        <div class="price-marker-wrap">
          <div class="price-marker-box">
            <div class="pm-title">${title}</div>
            <div class="pm-price">${price}</div>
            <div class="pm-status ${colorClass}">${status}</div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  L.marker([35.1685, 129.1680], {icon: createMapMarker('중동', '7,700원', '매우 바쁨', 'red')}).addTo(map);
  L.marker([35.1650, 129.1720], {icon: createMapMarker('좌동', '5,400원', '바쁨', 'orange')}).addTo(map);
  L.marker([35.1635, 129.1645], {icon: createMapMarker('우동', '3,300원', '보통', 'blue')}).addTo(map);


  // 3. Tab Navigation Logic (Inside expanded sheet)
  const tabMission = document.getElementById('tab-mission');
  const tabOrder = document.getElementById('tab-order');
  const viewMission = document.getElementById('view-mission');
  const viewOrder = document.getElementById('view-order');
  const indicator = document.querySelector('.tab-indicator');

  function switchTab(tab) {
    if (tab === 'mission') {
      tabMission.classList.add('active');
      tabOrder.classList.remove('active');
      viewMission.classList.add('active');
      viewOrder.classList.remove('active');
      indicator.style.transform = 'translateX(0%)';
    } else {
      tabOrder.classList.add('active');
      tabMission.classList.remove('active');
      viewOrder.classList.add('active');
      viewMission.classList.remove('active');
      indicator.style.transform = 'translateX(100%)';
    }
  }

  tabMission.addEventListener('click', () => switchTab('mission'));
  tabOrder.addEventListener('click', () => switchTab('order'));
  switchTab('mission');


  // 4. Bottom Sheet Drag Logic
  const bottomSheet = document.getElementById('bottom-sheet');
  const dragHandle = document.getElementById('drag-handle');
  const appContainer = document.querySelector('.app-container');
  
  let isDragging = false;
  let startY = 0;
  let currentTranslateY = 0;
  
  const appHeight = appContainer.clientHeight;
  const closedY = appHeight - 250; // finely tuned height for mission tabs + card peek
  const openY = appHeight * 0.15;

  currentTranslateY = closedY;
  bottomSheet.style.transform = `translateY(${currentTranslateY}px)`;

  const onDragStart = (y) => {
    isDragging = true;
    startY = y;
    bottomSheet.classList.add('dragging');
  };

  const onDragMove = (y) => {
    if (!isDragging) return;
    const deltaY = y - startY;
    let newY = currentTranslateY + deltaY;
    if (newY < openY) newY = openY;
    bottomSheet.style.transform = `translateY(${newY}px)`;
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.classList.remove('dragging');
    
    // Smooth snapping
    const currentY = parseFloat(bottomSheet.style.transform.replace('translateY(', '').replace('px)', ''));
    const midPoint = (openY + closedY) / 2;

    if (currentY < midPoint) currentTranslateY = openY;
    else currentTranslateY = closedY;
    
    bottomSheet.style.transform = `translateY(${currentTranslateY}px)`;
  }

  // Touch Events
  dragHandle.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientY));
  window.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientY));
  window.addEventListener('touchend', onDragEnd);

  // Mouse Events
  dragHandle.addEventListener('mousedown', (e) => onDragStart(e.clientY));
  window.addEventListener('mousemove', (e) => onDragMove(e.clientY));
  window.addEventListener('mouseup', onDragEnd);
  
  // 5. Driving Toggle Logic
  const drivingToggle = document.querySelector('.driving-toggle');
  const toggleText = document.querySelector('.toggle-text');
  const floatingStatus = document.querySelector('.floating-status');
  const urgentContent = document.getElementById('urgent-content');
  const urgentEmptyState = document.getElementById('urgent-empty-state');
  
  let isDriving = true;
  drivingToggle.addEventListener('click', () => {
    isDriving = !isDriving;
    if (isDriving) {
      drivingToggle.classList.remove('offline');
      toggleText.innerText = '운행';
      if (floatingStatus) floatingStatus.classList.remove('hidden');
      
      // Show Urgent Cards
      if (urgentContent) urgentContent.classList.remove('hidden');
      if (urgentEmptyState) urgentEmptyState.classList.add('hidden');
      
    } else {
      drivingToggle.classList.add('offline');
      toggleText.innerText = '휴식';
      if (floatingStatus) floatingStatus.classList.add('hidden');
      
      // Hide Urgent Cards, Show Empty State
      if (urgentContent) urgentContent.classList.add('hidden');
      if (urgentEmptyState) {
        urgentEmptyState.classList.remove('hidden');
        // Re-init lucide icons for the coffee cup
        if (window.lucide) window.lucide.createIcons();
      }
      
      // Ensure bottom sheet collapses if it was fully expanded
      if (currentTranslateY < closedY) {
        currentTranslateY = closedY;
        bottomSheet.style.transform = `translateY(${currentTranslateY}px)`;
      }
    }
  });

  // 6. Swipe-to-Assign Logic
  const recommendCards = document.querySelectorAll('#view-order .recommend-card');
  let currentProgressCount = 0;
  const progressCountEl = document.querySelectorAll('.status-item')[0].querySelector('span'); // Pick "진행" element safely
  const urgentCountEl = document.querySelector('#view-order .mh-right strong'); // "픽업 대기중 3건"

  recommendCards.forEach(card => {
    // 1. Wrap card for swipe layout
    const container = document.createElement('div');
    container.className = 'swipe-container';
    card.parentNode.insertBefore(container, card);
    
    const leftBg = document.createElement('div');
    leftBg.className = 'swipe-bg swipe-left-bg';
    leftBg.innerText = '배정';
    
    const rightBg = document.createElement('div');
    rightBg.className = 'swipe-bg swipe-right-bg';
    rightBg.innerText = '배정';
    
    container.appendChild(leftBg);
    container.appendChild(rightBg);
    
    card.classList.add('swipeable-card');
    container.appendChild(card);
    
    // 2. Drag Logic
    let isDraggingCard = false;
    let startX = 0;
    let currentX = 0;
    
    const startDrag = (e) => {
      isDraggingCard = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      card.classList.add('dragging');
    };
    
    const moveDrag = (e) => {
      if (!isDraggingCard) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      currentX = x - startX;
      
      // Optional: Prevent browser backward/forward gestures while swiping
      if (e.cancelable && Math.abs(currentX) > 10) e.preventDefault();
      
      card.style.transform = `translateX(${currentX}px)`;
    };
    
    const endDrag = () => {
      if (!isDraggingCard) return;
      isDraggingCard = false;
      card.classList.remove('dragging');
      
      const threshold = 120; // 120px to assign
      if (Math.abs(currentX) > threshold) {
        // Trigger assignment animation
        const direction = currentX > 0 ? 1 : -1;
        card.style.transform = `translateX(${window.innerWidth * direction}px)`;
        
        setTimeout(() => {
          // Smooth collapse container
          container.style.height = container.offsetHeight + 'px';
          container.offsetHeight; // force reflow
          container.style.transition = 'all 0.4s ease';
          container.style.height = '0px';
          container.style.margin = '0px';
          container.style.opacity = '0';
          
          setTimeout(() => {
            container.remove();
            
            // Top UI Update
            currentProgressCount++;
            if (progressCountEl) progressCountEl.innerText = currentProgressCount;
            
            // Side Count Update
            const remaining = document.querySelectorAll('#view-order .swipe-container').length;
            if (urgentCountEl) urgentCountEl.innerText = `${remaining}건`;
          }, 400);
        }, 300);
      } else {
        // Snap back softly
        currentX = 0;
        card.style.transform = `translateX(0px)`;
      }
    };
    
    card.addEventListener('touchstart', startDrag, {passive: true});
    card.addEventListener('touchmove', moveDrag, {passive: false});
    card.addEventListener('touchend', endDrag);
    
    // PC Support
    card.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag, {passive: false});
    window.addEventListener('mouseup', endDrag);
  });

  // 7. Progress Overlay Logic
  const openProgressBtn = document.getElementById('open-progress-overlay');
  const progressOverlay = document.getElementById('progress-overlay');
  const closeProgressBtn = document.getElementById('close-progress');
  const overlayProgressCnt = document.getElementById('overlay-progress-cnt');
  
  if (openProgressBtn) {
    openProgressBtn.addEventListener('click', () => {
      if (overlayProgressCnt) overlayProgressCnt.innerText = currentProgressCount;
      progressOverlay.classList.remove('hidden');
    });
  }
  if (closeProgressBtn) {
    closeProgressBtn.addEventListener('click', () => progressOverlay.classList.add('hidden'));
  }

  // 8. Order Detail View Logic
  const sampleProgressCard = document.getElementById('sample-progress-card');
  const orderDetailView = document.getElementById('order-detail-view');
  const backFromDetail = document.getElementById('back-from-detail');
  
  if (sampleProgressCard) {
    sampleProgressCard.addEventListener('click', () => {
      progressOverlay.classList.add('hidden');
      document.querySelector('.top-ui').classList.add('hidden');
      document.getElementById('bottom-sheet').classList.add('hidden');
      orderDetailView.classList.remove('hidden');
    });
  }
  
  if (backFromDetail) {
    backFromDetail.addEventListener('click', () => {
      orderDetailView.classList.add('hidden');
      document.querySelector('.top-ui').classList.remove('hidden');
      document.getElementById('bottom-sheet').classList.remove('hidden');
      progressOverlay.classList.remove('hidden');
    });
  }

  // 9. Huge Swipe Button inside Detail View
  const hugeSwipeBtn = document.getElementById('pickup-swipe-btn');
  if (hugeSwipeBtn) {
    const slider = hugeSwipeBtn.querySelector('.hs-slider');
    const maxX = hugeSwipeBtn.clientWidth - 70 - 12; // 70px width + 6px padding on both sides
    
    let isDraggingSlider = false;
    let sliderStartX = 0;
    let sliderCurrentX = 0;
    
    const sliderStart = (e) => {
      isDraggingSlider = true;
      sliderStartX = e.touches ? e.touches[0].clientX : e.clientX;
      slider.classList.add('dragging');
    };
    
    const sliderMove = (e) => {
      if (!isDraggingSlider) return;
      let x = e.touches ? e.touches[0].clientX : e.clientX;
      sliderCurrentX = x - sliderStartX;
      if (sliderCurrentX < 0) sliderCurrentX = 0;
      if (sliderCurrentX > maxX) sliderCurrentX = maxX;
      slider.style.transform = `translateX(${sliderCurrentX}px)`;
    };
    
    const sliderEnd = () => {
      if (!isDraggingSlider) return;
      isDraggingSlider = false;
      slider.classList.remove('dragging');
      
      if (sliderCurrentX > maxX * 0.8) {
        slider.style.transform = `translateX(${maxX}px)`;
        hugeSwipeBtn.querySelector('.hs-bg').innerText = '픽업 완료!';
        hugeSwipeBtn.style.background = '#3b82f6';
        slider.style.pointerEvents = 'none';
        
        setTimeout(() => {
          backFromDetail.click();
        }, 1000);
      } else {
        sliderCurrentX = 0;
        slider.style.transform = `translateX(0px)`;
      }
    };
    
    slider.addEventListener('touchstart', sliderStart, {passive: true});
    window.addEventListener('touchmove', sliderMove);
    window.addEventListener('touchend', sliderEnd);
    
    slider.addEventListener('mousedown', sliderStart);
    window.addEventListener('mousemove', sliderMove);
    window.addEventListener('mouseup', sliderEnd);
  }
});

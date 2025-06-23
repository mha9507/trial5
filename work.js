    document.addEventListener('DOMContentLoaded', function() {
      const background = document.getElementById('background');
      const scroller = document.getElementById('scroller');
      const runner = document.getElementById('runner');
      const arrowLeft = document.getElementById('arrowLeft');
      const arrowRight = document.getElementById('arrowRight');
      const leftGif = document.getElementById('leftGif');
      const rightGif = document.getElementById('rightGif');
      const projectsWrapper = document.querySelector('.projects-wrapper');
      
      // Remove blur effect when page loads
      background.classList.remove('blur');
      
      // Function to force GIFs to continuously loop
      function forceGifLoop(gifObject) {
        const originalSrc = gifObject.data;
        
        // First reset immediately
        setTimeout(() => {
          gifObject.data = '';
          gifObject.data = originalSrc;
        }, 100);
        
        // Then set up periodic reset
        setInterval(() => {
          gifObject.data = '';
          gifObject.data = originalSrc;
        }, 3000); // Reset every 3 seconds
      }
      
      // Check if GIFs loaded and force them to loop
      function checkAndLoopGifs() {
        if (leftGif.contentDocument) {
          forceGifLoop(leftGif);
        } else {
          leftGif.addEventListener('load', () => forceGifLoop(leftGif));
        }
        
        if (rightGif.contentDocument) {
          forceGifLoop(rightGif);
        } else {
          rightGif.addEventListener('load', () => forceGifLoop(rightGif));
        }
        
        // Show fallback arrows if GIFs fail to load
        setTimeout(() => {
          if (!leftGif.contentDocument) {
            leftGif.nextElementSibling.style.display = 'block';
          }
          if (!rightGif.contentDocument) {
            rightGif.nextElementSibling.style.display = 'block';
          }
        }, 2000);
      }
      
      // Initialize GIF looping
      checkAndLoopGifs();
      
      // Set initial scroll position
      scroller.scrollLeft = 0;
      let currentProject = 0;
      const projectCount = 5; // Changed from 7 to 5
      let projectWidth = window.innerWidth;
      
      // Handle window resize
      function handleResize() {
        projectWidth = window.innerWidth;
        // Scroll to current project after resize
        scrollToProject(currentProject, false);
      }
      
      window.addEventListener('resize', handleResize);
      
      // Calculate total scrollable width
      const totalWidth = projectsWrapper.scrollWidth;
      
      // Update arrow visibility based on current position
      function updateArrows() {
        arrowLeft.style.display = currentProject > 0 ? 'flex' : 'none';
        arrowRight.style.display = currentProject < projectCount - 1 ? 'flex' : 'none';
      }
      
      // Scroll to specific project
      function scrollToProject(index, smooth = true) {
        currentProject = Math.max(0, Math.min(index, projectCount - 1));
        scroller.scrollTo({
          left: currentProject * projectWidth,
          behavior: smooth ? 'smooth' : 'auto'
        });
        updateArrows();
      }
      
      // Navigation arrow handlers
      arrowLeft.addEventListener('click', () => scrollToProject(currentProject - 1));
      arrowRight.addEventListener('click', () => scrollToProject(currentProject + 1));
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') scrollToProject(currentProject - 1);
        if (e.key === 'ArrowRight') scrollToProject(currentProject + 1);
      });
      
      // Update positions on scroll
      scroller.addEventListener('scroll', function() {
        const scrollPos = scroller.scrollLeft;
        const scrollPercentage = scrollPos / (totalWidth - window.innerWidth);
        
        // Update current project
        currentProject = Math.round(scrollPos / projectWidth);
        updateArrows();
        
        // Move runner across the screen
        const runnerMaxPos = window.innerWidth - 120;
        runner.style.left = `${30 + (scrollPercentage * runnerMaxPos)}px`;
      }, { passive: true });
      
      // Add runner animation
      let frame = 0;
      setInterval(() => {
        frame = (frame + 1) % 4;
        runner.style.transform = `translateY(${frame % 2 === 0 ? -5 : 0}px)`;
      }, 200);
      
      // Initialize arrows
      updateArrows();
      
      // Touch support for mobile
      let isDragging = false;
      let startX;
      let scrollLeft;
      let startTime;
      
      scroller.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
        startTime = Date.now();
        scroller.style.cursor = 'grabbing';
        scroller.style.scrollSnapType = 'none';
      });
      
      scroller.addEventListener('mouseleave', () => {
        if (isDragging) {
          isDragging = false;
          scroller.style.cursor = 'grab';
          scroller.style.scrollSnapType = 'x mandatory';
          snapToNearestProject();
        }
      });
      
      scroller.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          scroller.style.cursor = 'grab';
          scroller.style.scrollSnapType = 'x mandatory';
          const elapsed = Date.now() - startTime;
          // Only snap if it wasn't a quick swipe
          if (elapsed > 100) {
            snapToNearestProject();
          }
        }
      });
      
      scroller.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        const walk = (x - startX) * 2;
        scroller.scrollLeft = scrollLeft - walk;
      });
      
      // Touch events
      scroller.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
        startTime = Date.now();
        scroller.style.scrollSnapType = 'none';
      }, { passive: true });
      
      scroller.addEventListener('touchend', () => {
        if (isDragging) {
          isDragging = false;
          scroller.style.scrollSnapType = 'x mandatory';
          const elapsed = Date.now() - startTime;
          // Only snap if it wasn't a quick swipe
          if (elapsed > 100) {
            snapToNearestProject();
          }
        }
      });
      
      scroller.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - scroller.offsetLeft;
        const walk = (x - startX) * 2;
        scroller.scrollLeft = scrollLeft - walk;
      }, { passive: true });
      
      // Snap to nearest project after dragging
      function snapToNearestProject() {
        const scrollPos = scroller.scrollLeft;
        const projectIndex = Math.round(scrollPos / projectWidth);
        scrollToProject(projectIndex);
      }
      
      // Prevent vertical scroll when swiping horizontally
      document.body.addEventListener('touchmove', function(e) {
        if (isDragging) {
          e.preventDefault();
        }
      }, { passive: false });
    });

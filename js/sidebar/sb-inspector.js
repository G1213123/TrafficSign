/* Object Inspector Panel */
let CanvasObjectInspector = {
  createObjectListPanelInit: function () {
    const objectListPanel = document.getElementById('objectListPanel');

    // Clear the existing content
    objectListPanel.innerHTML = '';

    // Loop through the CanvasObject array and append object names to the list
    canvasObject.forEach((obj, index) => {
      const div = document.createElement('div');
      div.className = 'object-list-item';
      div.innerText = obj._showName;
      div.id = `Group (${index})`;
      div.addEventListener('click', () => {
        // Remove 'selected' class from all items
        document.querySelectorAll('.object-list-item').forEach(item => item.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        div.classList.add('selected');
        canvas.setActiveObject(obj);
        canvas.renderAll();
        // Scroll the parent container to the clicked item
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      objectListPanel.appendChild(div);
    });
  },

  SetActiveObjectList: function (setActive) {
    const index = canvasObject.indexOf(setActive);
    // Remove 'selected' class from all items
    document.querySelectorAll('.object-list-item').forEach(item => {
      if (item.id == `Group (${index})`) {
        item.classList.add('selected');
        // Scroll the parent container to the active item
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
}

// Export the CanvasObjectInspector for use in other files
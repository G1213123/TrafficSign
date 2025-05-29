/**
 * mdGeneral.js - Common Modal Utilities
 * This module provides shared functions for modal creation and management
 */

const ModalUtils = {
  /**
   * Create a basic modal structure
   * @param {string} modalId - Unique ID for the modal
   * @param {string} title - Modal title text
   * @returns {Object} - Object containing modal and modalContent elements
   */
  createModal: function (modalId, title) {
    // Remove existing modal if any
    let existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal container
    const modal = document.createElement('div');
    modal.id = modalId;

    // Create modal content box
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Modal Title
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'close-button';
    closeButton.onclick = () => modal.remove();

    // Assemble basic structure
    modalContent.appendChild(closeButton);
    modalContent.appendChild(titleElement);
    modal.appendChild(modalContent);

    return { modal, modalContent, titleElement, closeButton };
  },

  /**
   * Create a button with specified properties
   * @param {string} text - Button text
   * @param {string} className - CSS class name
   * @param {Function} onClick - Click handler function
   * @returns {HTMLButtonElement} - Created button element
   */
  createButton: function (text, className, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    if (onClick) {
      button.onclick = onClick;
    }
    return button;
  },

  /**
   * Create a buttons container
   * @param {Array} buttons - Array of button elements to add
   * @returns {HTMLDivElement} - Container with buttons
   */
  createButtonsContainer: function (buttons = []) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    buttons.forEach(button => {
      if (button) {
        buttonsContainer.appendChild(button);
      }
    });
    return buttonsContainer;
  },

  /**
   * Create an info text paragraph
   * @param {string} text - Text content
   * @returns {HTMLParagraphElement} - Info text element
   */
  createInfoText: function (text) {
    const infoText = document.createElement('p');
    infoText.textContent = text;
    infoText.className = 'info-text';
    return infoText;
  },

  /**
   * Create a text area with specified properties
   * @param {string} id - Element ID
   * @param {string} placeholder - Placeholder text
   * @returns {HTMLTextAreaElement} - Created textarea element
   */
  createTextArea: function (id, placeholder) {
    const textArea = document.createElement('textarea');
    textArea.id = id;    textArea.placeholder = placeholder;
    return textArea;
  },

  /**
   * Create a section container
   * @param {string} className - CSS class name
   * @returns {HTMLDivElement} - Section container element
   */
  createSection: function (className) {
    const section = document.createElement('div');
    section.className = className;
    return section;
  },

  /**
   * Show modal by appending to document body and optionally focus an element
   * @param {HTMLElement} modal - Modal element to show
   * @param {HTMLElement} focusElement - Element to focus after showing modal
   * @param {boolean} closeOnOutsideClick - Whether to close modal when clicking outside (default: true)
   */
  showModal: function (modal, focusElement = null, closeOnOutsideClick = true) {


    // Add click outside to close functionality (if enabled)
    if (closeOnOutsideClick) {
      modal.onclick = function(event) {
        // Only close if clicking directly on the modal overlay (not the modal content)
        if (event.target === modal) {
          modal.remove();
        }
      };
    }

    // Prevent clicks on modal content from bubbling up to the overlay
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.onclick = function(event) {
        event.stopPropagation();
      };
    }

    // Add ESC key support to close modal
    const handleKeyDown = function(event) {
      if (event.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Clean up event listener when modal is removed
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
      document.removeEventListener('keydown', handleKeyDown);
      originalRemove();
    };

    document.body.appendChild(modal);
    if (focusElement) {
      focusElement.focus();
    }
  },

  /**
   * Remove modal from DOM
   * @param {string} modalId - ID of modal to remove
   */
  removeModal: function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }
};

export { ModalUtils };

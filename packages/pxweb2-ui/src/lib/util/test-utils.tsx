// Mock for showModal and close
const mockHTMLDialogElement = () => {
  if (!window.HTMLDialogElement.prototype.showModal) {
    window.HTMLDialogElement.prototype.showModal = function () {
      this.style.display = 'block';
    };
  }

  if (!window.HTMLDialogElement.prototype.close) {
    window.HTMLDialogElement.prototype.close = function () {
      this.style.display = 'none';
    };
  }
};

export { mockHTMLDialogElement };

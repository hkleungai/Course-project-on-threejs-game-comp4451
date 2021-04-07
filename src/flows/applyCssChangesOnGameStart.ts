const startMenu: HTMLElement = document.querySelector('.start-menu');
const avaliableActionMenu: HTMLElement = document.querySelector('.action-menu');
const hamburger: HTMLElement = document.querySelector(".hamburger");
const navigation: HTMLElement = document.querySelector(".navigation");

const applyCssChangesOnGameStart = (): void => {
  startMenu.style.display = 'none';

  avaliableActionMenu.style.display = 'block';

  hamburger.onclick = () => {
    if (hamburger.classList.contains('is-active')) {
      hamburger.classList.remove('is-active');
      navigation.style.display = 'none';
    } else {
      hamburger.classList.toggle("is-active");
      navigation.style.display = 'block';
    }
  };

  const availableavailableActionDivs = document.querySelectorAll("[class*=available-action]");
  availableavailableActionDivs.forEach((availableActionDiv: HTMLElement) => {
    // eslint-disable-next-line no-alert
    availableActionDiv.onclick = () => alert('Please select an unit first.');
  });
  const unavailableavailableActionDivs = document.querySelectorAll("[class*=unavailable-action]");
  unavailableavailableActionDivs.forEach((unavailableActionDiv: HTMLElement) => {
    // eslint-disable-next-line no-alert
    unavailableActionDiv.onclick = () => alert('This action is not available');
  });
};

export { applyCssChangesOnGameStart };

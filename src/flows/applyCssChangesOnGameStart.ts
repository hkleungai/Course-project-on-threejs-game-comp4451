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
};

export { applyCssChangesOnGameStart };

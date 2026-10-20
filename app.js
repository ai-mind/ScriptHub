const commands = [
  {name:'Open Safari',type:'Application',icon:'search',style:'safari',keywords:'browser internet web'},
  {name:'Start my workday',type:'Shortcut',icon:'layers',style:'shortcut',keywords:'shortcuts work routine automation'},
  {name:'Toggle appearance',type:'System',icon:'moon',style:'',keywords:'dark light theme mode appearance'},
  {name:'Open Terminal',type:'Application',icon:'terminal',style:'terminal',keywords:'console shell command'},
  {name:'Turn on Focus',type:'System',icon:'moon',style:'focus',keywords:'do not disturb notifications'},
  {name:'Lock Mac',type:'System',icon:'lock',style:'',keywords:'lock screen security'},
  {name:'Open Finder',type:'Application',icon:'grid',style:'safari',keywords:'files folders documents'},
  {name:'Take a break',type:'Shortcut',icon:'coffee',style:'shortcut',keywords:'shortcuts rest timer'}
];
const infoDialog = document.querySelector('#info-dialog');
const commandDialog = document.querySelector('#command-dialog');
const toast = document.querySelector('#demo-toast');
let toastTimer;
let returnFocus;

function closeDialog(dialog) {
  dialog.close();
}

function openDialog(dialog) {
  returnFocus = document.activeElement;
  document.querySelectorAll('dialog[open]').forEach(open => open.close());
  hideToast();
  dialog.showModal();
  document.body.classList.add('body-dialog-open');
}

function hideToast() {
  clearTimeout(toastTimer);
  toast.classList.remove('visible');
}

function runDemo(command) {
  if (commandDialog.open) closeDialog(commandDialog);
  document.querySelector('#toast-title').textContent = command.name;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}

function createPalette(element) {
  const input = element.querySelector('input');
  const list = element.querySelector('.command-list');
  const label = element.querySelector('.palette-section > span');
  let matches = commands.slice(0, 5);
  let selected = 0;

  function select(index) {
    if (!matches.length) return;
    selected = (index + matches.length) % matches.length;
    const rows = [...list.querySelectorAll('[role="option"]')];
    rows.forEach((row, i) => row.setAttribute('aria-selected', String(i === selected)));
    input.setAttribute('aria-activedescendant', rows[selected].id);
    const row = rows[selected];
    const rowRect = row.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (rowRect.top < listRect.top) list.scrollTop += rowRect.top - listRect.top;
    else if (rowRect.bottom > listRect.bottom) list.scrollTop += rowRect.bottom - listRect.bottom;
  }

  function render() {
    const query = input.value.trim().toLowerCase();
    matches = query ? commands.filter(command => `${command.name} ${command.type} ${command.keywords}`.toLowerCase().includes(query)) : commands.slice(0, 5);
    selected = 0;
    label.textContent = query ? 'SEARCH RESULTS' : 'SUGGESTIONS';
    list.replaceChildren();
    input.removeAttribute('aria-activedescendant');
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-search"/></svg><span>No commands found</span><small>Try “Safari”, “theme”, or “Shortcuts”.</small>';
      list.append(empty);
      return;
    }
    matches.forEach((command, index) => {
      const row = document.createElement('div');
      row.className = 'command-row';
      row.id = `${element.id}-option-${index}`;
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', String(index === selected));
      row.innerHTML = `<span class="command-icon ${command.style}" aria-hidden="true"><svg class="icon"><use href="#i-${command.icon}"/></svg></span><span class="command-label">${command.name}</span><span class="command-type">${command.type}</span><span class="command-enter" aria-hidden="true">↵</span>`;
      row.addEventListener('pointermove', () => select(index));
      row.addEventListener('mousedown', event => event.preventDefault());
      row.addEventListener('click', () => runDemo(command));
      list.append(row);
    });
    input.setAttribute('aria-activedescendant', list.firstElementChild.id);
    list.scrollTop = 0;
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      select(selected + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' && matches.length) {
      event.preventDefault();
      runDemo(matches[selected]);
    } else if (event.key === 'Escape' && !commandDialog.open) {
      input.value = '';
      render();
      input.blur();
    }
  });
  render();
  return {reset() { input.value = ''; render(); input.focus(); }};
}

createPalette(document.querySelector('#inline-palette'));
const modalPalette = createPalette(document.querySelector('#modal-palette'));

function openDemo() {
  openDialog(commandDialog);
  modalPalette.reset();
}

const modalContent = {
  download: {icon:'download',eyebrow:'COMING TO YOUR MAC',title:'The first release is on its way',description:'No releases are available yet. We’re getting ScriptHub ready for launch. Check back later for a free download.',footnote:'Thanks for your interest in the project.'},
  donate: {icon:'heart',eyebrow:'THANK YOU FOR YOUR SUPPORT',title:'Coffee can wait ☕',description:'Donations aren’t set up yet. We really appreciate your support for ScriptHub. You’ll be able to contribute here later.',footnote:'The app will remain free.'}
};

document.querySelectorAll('[data-modal]').forEach(button => button.addEventListener('click', () => {
  const content = modalContent[button.dataset.modal];
  document.querySelector('#modal-icon use').setAttribute('href', `#i-${content.icon}`);
  document.querySelector('#modal-eyebrow').textContent = content.eyebrow;
  document.querySelector('#modal-title').textContent = content.title;
  document.querySelector('#modal-description').textContent = content.description;
  document.querySelector('#modal-footnote').textContent = content.footnote;
  openDialog(infoDialog);
}));
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', openDemo));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) {
      document.body.classList.remove('body-dialog-open');
      if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
    }
  });
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'k' || event.code === 'KeyK')) {
    event.preventDefault();
    if (commandDialog.open) closeDialog(commandDialog);
    else openDemo();
  }
});
toast.querySelector('button').addEventListener('click', hideToast);

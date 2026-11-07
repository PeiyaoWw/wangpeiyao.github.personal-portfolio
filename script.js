const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
  observer.observe(item);
});

const cursor = document.querySelector('.cursor');
window.addEventListener('pointermove', (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});
document.querySelectorAll('a').forEach((link) => {
  link.addEventListener('mouseenter', () => { cursor.style.width = '34px'; cursor.style.height = '34px'; });
  link.addEventListener('mouseleave', () => { cursor.style.width = '10px'; cursor.style.height = '10px'; });
});

function updateClock() {
  document.querySelector('#clock').textContent = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 30000);

const EDIT_STORAGE_KEY = 'portfolio-editor-v1';
const OBSOLETE_CONTACT_NOTE_KEY = 'contact-note';
document.querySelectorAll(`[data-edit-key="${OBSOLETE_CONTACT_NOTE_KEY}"]`).forEach((element) => element.remove());
const editableElements = [...document.querySelectorAll('[data-edit-key]')];
const defaults = Object.fromEntries(editableElements.map((element) => [element.dataset.editKey, element.innerHTML]));
const defaultContact = {
  name: '你的名字',
  email: 'hello@example.com',
  xhsLabel: '小红书',
  xhs: '',
  linkedinLabel: 'LinkedIn',
  linkedin: '',
  instagramLabel: 'Instagram',
  instagram: ''
};
const editLaunch = document.querySelector('#editLaunch');
const editPanel = document.querySelector('#editPanel');
const editSave = document.querySelector('#editSave');
const editCancel = document.querySelector('#editCancel');
const editReset = document.querySelector('#editReset');
const editToast = document.querySelector('#editToast');
const editName = document.querySelector('#editName');
const editEmail = document.querySelector('#editEmail');
const editXhsLabel = document.querySelector('#editXhsLabel');
const editXhs = document.querySelector('#editXhs');
const editLinkedinLabel = document.querySelector('#editLinkedinLabel');
const editLinkedin = document.querySelector('#editLinkedin');
const editInstagramLabel = document.querySelector('#editInstagramLabel');
const editInstagram = document.querySelector('#editInstagram');
const imageElements = [...document.querySelectorAll('[data-image-key]')];
const imageUploadInput = document.querySelector('#imageUploadInput');
const editExport = document.querySelector('#editExport');
const editImport = document.querySelector('#editImport');
const editImportInput = document.querySelector('#editImportInput');
let editSnapshot = null;
let activeImageKey = null;

function readSavedData() {
  try {
    const saved = JSON.parse(localStorage.getItem(EDIT_STORAGE_KEY)) || { content: {}, contact: defaultContact };
    if (saved.content && Object.prototype.hasOwnProperty.call(saved.content, OBSOLETE_CONTACT_NOTE_KEY)) {
      delete saved.content[OBSOLETE_CONTACT_NOTE_KEY];
      localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(saved));
    }
    return saved;
  } catch {
    return { content: {}, contact: defaultContact };
  }
}

function safeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return '#';
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch {
    return '#';
  }
}

function applyContact(contact = defaultContact) {
  const name = (contact.name || defaultContact.name).trim();
  const email = (contact.email || defaultContact.email).trim();
  document.querySelector('#profileNameAbout').textContent = name;
  document.querySelector('#profileNameFooter').textContent = name;
  document.title = `${name}｜个人作品集`;
  document.querySelector('#contactEmailText').textContent = email;
  document.querySelector('#contactEmailLink').href = `mailto:${email}`;
  document.querySelector('#xhsLink').textContent = (contact.xhsLabel || defaultContact.xhsLabel).trim();
  document.querySelector('#xhsLink').href = safeUrl(contact.xhs || '');
  document.querySelector('#linkedinLink').textContent = (contact.linkedinLabel || defaultContact.linkedinLabel).trim();
  document.querySelector('#linkedinLink').href = safeUrl(contact.linkedin || '');
  document.querySelector('#instagramLink').textContent = (contact.instagramLabel || defaultContact.instagramLabel).trim();
  document.querySelector('#instagramLink').href = safeUrl(contact.instagram || '');
}

function applyData(data) {
  editableElements.forEach((element) => {
    const saved = data.content?.[element.dataset.editKey];
    element.innerHTML = typeof saved === 'string' ? saved : defaults[element.dataset.editKey];
  });
  applyContact(data.contact);
  applyImages(data.images || {});
}

function applyImages(images = {}) {
  imageElements.forEach((image) => {
    const value = images[image.dataset.imageKey];
    const container = image.parentElement;
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      image.src = value;
      container.classList.add('has-edited-image');
    } else {
      image.removeAttribute('src');
      container.classList.remove('has-edited-image');
    }
  });
}

function collectImages() {
  return Object.fromEntries(imageElements
    .filter((image) => image.parentElement.classList.contains('has-edited-image') && image.src.startsWith('data:image/'))
    .map((image) => [image.dataset.imageKey, image.src]));
}

function fillContactFields(contact = defaultContact) {
  editName.value = contact.name || defaultContact.name;
  editEmail.value = contact.email || '';
  editXhsLabel.value = contact.xhsLabel || defaultContact.xhsLabel;
  editXhs.value = contact.xhs || '';
  editLinkedinLabel.value = contact.linkedinLabel || defaultContact.linkedinLabel;
  editLinkedin.value = contact.linkedin || '';
  editInstagramLabel.value = contact.instagramLabel || defaultContact.instagramLabel;
  editInstagram.value = contact.instagram || '';
}

function collectData() {
  return {
    content: Object.fromEntries(editableElements.map((element) => [element.dataset.editKey, element.innerHTML.trim()])),
    contact: {
      name: editName.value.trim() || defaultContact.name,
      email: editEmail.value.trim(),
      xhsLabel: editXhsLabel.value.trim() || defaultContact.xhsLabel,
      xhs: editXhs.value.trim(),
      linkedinLabel: editLinkedinLabel.value.trim() || defaultContact.linkedinLabel,
      linkedin: editLinkedin.value.trim(),
      instagramLabel: editInstagramLabel.value.trim() || defaultContact.instagramLabel,
      instagram: editInstagram.value.trim()
    },
    images: collectImages()
  };
}

function setEditing(active) {
  document.body.classList.toggle('editing', active);
  editableElements.forEach((element) => {
    element.contentEditable = active ? 'true' : 'false';
    element.spellcheck = active;
  });
  editPanel.hidden = !active;
  editLaunch.hidden = active;
}

function showToast(message) {
  editToast.textContent = message;
  editToast.classList.add('show');
  window.setTimeout(() => editToast.classList.remove('show'), 2200);
}

function startEditing() {
  const saved = readSavedData();
  editSnapshot = {
    content: Object.fromEntries(editableElements.map((element) => [element.dataset.editKey, element.innerHTML])),
    contact: { ...saved.contact },
    images: { ...(saved.images || collectImages()) }
  };
  fillContactFields(saved.contact);
  setEditing(true);
  showToast('编辑模式已开启');
}

editableElements.filter((element) => element.hasAttribute('data-edit-single')).forEach((element) => {
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      element.blur();
    }
  });
});

document.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (document.body.classList.contains('editing')) event.preventDefault();
  });
});

editLaunch.addEventListener('click', startEditing);
editSave.addEventListener('click', () => {
  const data = collectData();
  if (!data.contact.email || !data.contact.email.includes('@')) {
    editEmail.focus();
    showToast('请填写有效邮箱');
    return;
  }
  try {
    localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    showToast('图片较大，保存空间不足，请换一张更小的图片');
    return;
  }
  applyContact(data.contact);
  setEditing(false);
  editSnapshot = null;
  showToast('修改已保存在此浏览器');
});
editCancel.addEventListener('click', () => {
  if (editSnapshot) applyData(editSnapshot);
  setEditing(false);
  editSnapshot = null;
  showToast('已取消修改');
});
editReset.addEventListener('click', () => {
  if (!window.confirm('确定恢复全部默认内容吗？此浏览器中保存的修改将被清除。')) return;
  localStorage.removeItem(EDIT_STORAGE_KEY);
  const resetData = { content: defaults, contact: defaultContact, images: {} };
  applyData(resetData);
  fillContactFields(defaultContact);
  editSnapshot = { content: { ...defaults }, contact: { ...defaultContact } };
  showToast('已恢复默认内容');
});

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.onload = () => {
      const source = new Image();
      source.onerror = () => reject(new Error('图片格式无法读取'));
      source.onload = () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(source.width * scale));
        canvas.height = Math.max(1, Math.round(source.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      source.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

imageElements.forEach((image) => {
  image.parentElement.addEventListener('click', (event) => {
    if (!document.body.classList.contains('editing')) return;
    event.preventDefault();
    event.stopPropagation();
    activeImageKey = image.dataset.imageKey;
    imageUploadInput.value = '';
    imageUploadInput.click();
  });
});

imageUploadInput.addEventListener('change', async () => {
  const file = imageUploadInput.files?.[0];
  if (!file || !activeImageKey) return;
  showToast('正在处理图片…');
  try {
    const value = await compressImage(file);
    const current = collectImages();
    current[activeImageKey] = value;
    applyImages(current);
    showToast('图片已替换，点击保存修改');
  } catch (error) {
    showToast(error.message || '图片处理失败');
  }
});

document.querySelectorAll('[data-remove-image]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const current = collectImages();
    delete current[button.dataset.removeImage];
    applyImages(current);
    showToast('图片已移除，点击保存修改');
  });
});

editExport.addEventListener('click', () => {
  const data = collectData();
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('编辑备份已下载');
});

editImport.addEventListener('click', () => {
  editImportInput.value = '';
  editImportInput.click();
});

editImportInput.addEventListener('change', async () => {
  const file = editImportInput.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data.content || !data.contact) throw new Error('备份文件无效');
    applyData(data);
    fillContactFields(data.contact);
    showToast('备份已导入，点击保存修改');
  } catch (error) {
    showToast(error.message || '无法导入备份');
  }
});

applyData(readSavedData());

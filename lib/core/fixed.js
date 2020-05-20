import {
  cloneNode,
  appendChild,
  appendChildren,
  createElement,
  querySelectorAll,
  offsetHeight,
  styled,
} from './node-ops';
import {
  getAttrNumber,
  createTableWrapper,
} from './utils';

export default function(vm, theadModel, tbodyModel, tfootModel) {
  let rootMinWidth = 320;
  const { fixedLeft, fixedRight } = vm.props;

  //左边有固定列
  if (fixedLeft.thead.length > 0) {
    rootMinWidth = rootMinWidth > fixedLeft.width ? rootMinWidth : fixedLeft.width;
    const headerWrapper = createHeaderWrapper(vm, theadModel, fixedLeft);
    const footerWrapper = createFooterWrapper(vm, tfootModel, fixedLeft);
    const bodyWrapper = createBodyWrapper(vm, tbodyModel, fixedLeft, 'left');
    vm.$fixedLeft = createContainer(vm, headerWrapper, bodyWrapper, footerWrapper, fixedLeft, 'stb_fixed', 'left');
    appendChild(vm.$root, vm.$fixedLeft);
    vm.$fixedLeftBody = bodyWrapper;
  }
  //右边有固定列
  if (fixedRight.thead.length > 0) {
    rootMinWidth = rootMinWidth + fixedRight.width;
    const headerWrapper = createHeaderWrapper(vm, theadModel, fixedRight);
    const footerWrapper = createFooterWrapper(vm, tfootModel, fixedRight);
    const bodyWrapper = createBodyWrapper(vm, tbodyModel, fixedRight, 'right');
    vm.$fixedRight = createContainer(vm, headerWrapper, bodyWrapper, footerWrapper, fixedRight, 'stb_fixed-right', 'right');
    appendChild(vm.$root, vm.$fixedRight);
    vm.$fixedRightBody = bodyWrapper;

    let rightPatch = createElement("div", "stb_fixed-right-patch");
    styled(rightPatch, {
      display: 'none',
      width: vm.gutterWidth + "px",
      height: offsetHeight(vm.$thead) + "px"
    })
    appendChild(vm.$root, rightPatch)
    vm.$rightPatch = rightPatch;
    if (vm.scrollY) {
      styled(vm.$rightPatch, {
        display: 'block'
      })
    }
  }
  styled(vm.$root, {
    minWidth: rootMinWidth + "px"
  })
}

function createHeaderWrapper(vm, model, meta) {
  const thead = cloneNode(model, true);
  querySelectorAll(thead, "tr:first-child>th").forEach((column, index) => {
    if (meta.thead.indexOf("field-" + index) === -1) {
      column.classList.add('is-hidden')
    }
  })
  return createTableWrapper("stb_fixed-header-wrapper", vm, "header", thead);
}

function createFooterWrapper(vm, model, meta) {
  const tfoot = cloneNode(model, true);
  querySelectorAll(tfoot, "tr:first-child>td").forEach((column, index) => {
    if (meta.thead.indexOf("field-" + index) === -1) {
      column.classList.add('is-hidden')
    }
  })
  const footWrapper = createTableWrapper("stb_fixed-footer-wrapper", vm, "footer", tfoot);
  styled(footWrapper, {
    top: offsetHeight(vm.$thead) + (vm.size.tbodyWrapperHeight - (vm.scrollX ? (vm.gutterWidth - 8) : 0)) + "px"
  })
  return footWrapper
}

function createBodyWrapper(vm, model, meta, type) {
  const tbody = cloneNode(model, true);
  const rows = querySelectorAll(tbody, "tr");
  rows.forEach(row => {
    let offsetX = -1;
    querySelectorAll(row, "td").forEach((column, index) => {
      if (type === 'left') {
        offsetX = index
      } else {
        offsetX += getAttrNumber(column, "colspan", 1);
      }
      if (meta.tbody.indexOf("field-" + offsetX) === -1) {
        column.classList.add('is-hidden')
      }
    })
  })
  const bodyWrapper = createTableWrapper("stb_fixed-body-wrapper", vm, "body", tbody);
  styled(bodyWrapper, {
    top: offsetHeight(vm.$thead) + "px",
    height: (vm.size.tbodyWrapperHeight - (vm.scrollX ? vm.gutterWidth : 0)) + "px"
  })
  return bodyWrapper
}

function createContainer(vm, thead, tbody, tfoot, meta, className, type) {
  const fixedContainer = createElement("div", className);
  appendChildren(fixedContainer, [thead, tbody, tfoot]);
  const clientHeight = (offsetHeight(vm.$root) - (vm.scrollX ? vm.gutterWidth : 2));
  const tableHeight = offsetHeight(vm.$thead) + offsetHeight(vm.$tbody) + offsetHeight(vm.$tfoot);
  styled(fixedContainer, {
    width: meta.width + "px",
    height: (tableHeight > clientHeight ? clientHeight : tableHeight) + "px",
    right: type === 'right' ? ((vm.scrollY ? vm.gutterWidth : 0) + "px") : ''
  })
  return fixedContainer
}
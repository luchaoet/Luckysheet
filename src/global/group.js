import Store from "../store";

export function addRowsGroupItem(s, e, o = 1) {
  if(!Store.config.rowsGroup) {
    Store.config.rowsGroup = {}
  }
  const key = `${s}_${e}`;
  Store.config.rowsGroup[key] = {s, e, o: o >= 1 ? 1 : 0}
}

export function deleteRowsGroupItem(s, e) {
  const key = `${s}_${e}`;
  if(Store.config.rowsGroup && key in Store.config.rowsGroup) {
    delete Store.config.rowsGroup[key]
  }
}

export function deleteColsGroupItem(s, e) {
  const key = `${s}_${e}`;
  if(Store.config.colsGroup && key in Store.config.colsGroup) {
    delete Store.config.colsGroup[key]
  }
}

export function addColsGroupItem(s, e, o = 1) {
  if(!Store.config.colsGroup) {
    Store.config.colsGroup = {}
  }
  const key = `${s}_${e}`;
  Store.config.colsGroup[key] = {s, e, o: o >= 1 ? 1 : 0}
}

export function updateGroup(type, key, o) {
  const [s,e] = key.split('_').map(i => Number(i))
  if(type === 'row') {
    addRowsGroupItem(s,e,o)
  }else{
    addColsGroupItem(s,e,o)
  }
}

function getLevelGroup(data) {
  // 没有交集 可归为一组
  const result = []
  for (const item of data) {
    const index = result.findIndex(i => i.every(j => j.e < item.s || j.s > item.e))
    if(index === -1) {
      result.push(new Array({...item}))
    }else{
      result[index].push({...item})
    }
  }
  return result
}

export function getGroup() {
  if(!Store.config.rowsGroup) {
    Store.config.rowsGroup = {}
  }
  if(!Store.config.colsGroup) {
    Store.config.colsGroup = {}
  }
  return {
    rowsGroup: Store.config.rowsGroup,
    colsGroup: Store.config.colsGroup,
    rowsGroupLevel: getLevelGroup(Object.values(Store.config.rowsGroup)),
    colsGroupLevel: getLevelGroup(Object.values(Store.config.colsGroup)),
  }
}

export function getRowsGroupAreaWidth() {
  const { rowsGroupLevel } = getGroup();
  const { buttonSize, gap, padding } = getGroupConfig();
  const len = rowsGroupLevel.length;
  // 边距 + 按钮总宽度 + 按钮之间的距离
  return len === 0 ? 0 : padding * 2 + (buttonSize + gap) * len + buttonSize / 2;
}

export function getColsGroupAreaHeight() {
  const { colsGroupLevel } = getGroup();
  const { buttonSize, gap, padding } = getGroupConfig();
  const len = colsGroupLevel.length;
  // 边距 + 按钮总高度 + 按钮之间的距离
  return len === 0 ? 0 : padding * 2 + (buttonSize + gap) * len + buttonSize / 2;
}

export function toggleState(type, index) {
  const { rowsGroupLevel, colsGroupLevel } = getGroup();
  const group = Object.values(type === 'row' ? rowsGroupLevel : colsGroupLevel)[index]
  if(group.length) {
    const o = group[0].o;
    for (const {s, e} of group) {
      updateGroup(type, `${s}_${e}`, o === 0 ? 1 : 0)
    }
  }
}

export function getGroupConfig() {
  const group = Store.toJsonOptions?.group || {};
  const lineWidth = group.lineWidth || 1;
  const strokeStyle = group.strokeStyle || '#bcbdbc';
  const buttonSize = group.buttonSize && group.buttonSize > 10 ? group.buttonSize : 10;
  const gap = group.gap && group.gap > 1 ? group.gap : 1;
  const padding = group.padding && group.padding > 10 ? group.padding : 10;

  return {
    // 分组线条与左右边界的距离 默认 10
    padding: padding * Store.zoomRatio,
    // 线条上的按钮水平之间的距离 默认 1
    gap: gap * Store.zoomRatio,
    // 分组线条宽度 默认 1
    lineWidth,
    // 分组线条颜色/线条上按钮的填充色 默认 #bcbdbc
    strokeStyle,
    // 分组按钮大小 默认 10
    buttonSize: buttonSize * Store.zoomRatio
  }
}

export function isCloseRowRange(s, e) {
  if(!Store.config.rowsGroup) {
    Store.config.rowsGroup = {}
  }
  const closeGroup = Object.values(Store.config.rowsGroup).filter(i => i.o === 0)
  for (let i = s; i <= e; i++) {
    const isCloseRow = closeGroup.some(c => c.s <= i && c.e >= i);
    if(!isCloseRow) return false
  }
  return true
}

export function isCloseColRange(s, e) {
  if(!Store.config.colsGroup) {
    Store.config.colsGroup = {}
  }
  const closeGroup = Object.values(Store.config.colsGroup).filter(i => i.o === 0)
  for (let i = s; i <= e; i++) {
    const isCloseCol = closeGroup.some(c => c.s <= i && c.e >= i);
    if(!isCloseCol) return false
  }
  return true
}

// 分组区域点击位置 与线条上的按钮对应
export function rowsOfClickPosition(offsetY) {
  const y = offsetY + $("#luckysheet-rows-h").scrollTop();
  const rows = [];
  const { buttonSize } = getGroupConfig()
  for (let i = 0; i < Store.visibledatarow.length; i++) {
    const row = Store.visibledatarow[i];
    if(y < row) break;
    if(y >= row && y <= row + buttonSize) {
        rows.push(i)
    }
  }
  return rows
}
export function colsOfClickPosition(offsetX) {
  let x = offsetX + $("#luckysheet-cols-h-c").scrollLeft();

  const cols = [];
  const { buttonSize } = getGroupConfig()
  for (let i = 0; i < Store.visibledatacolumn.length; i++) {
    const col = Store.visibledatacolumn[i];
    if(x < col) break;
    if(x >= col && x <= col + buttonSize) {
      cols.push(i)
    }
  }
  return cols
}

// 分组区域点击位置对应的分组级别 
export function levelOfRowsGroupClickPosition(offsetX) {
  const { buttonSize, padding, gap } = getGroupConfig()
  const { rowsGroupLevel } = getGroup();

  let index = null;
  for (let i = 0; i < rowsGroupLevel.length; i++) {
    const x1 = padding + (buttonSize + gap) * i;
    const x2 = padding + buttonSize * (i + 1) + gap * (i - 1);
    if(offsetX >= x1 && offsetX <= x2) {
      index = i
    }
    if(offsetX < x1) {
      break
    }
  }
  return index
}
export function levelOfColsGroupClickPosition(offsetY) {
  const { buttonSize, padding, gap } = getGroupConfig()
  const { colsGroupLevel } = getGroup();

  let index = null;
  for (let i = 0; i < colsGroupLevel.length; i++) {
    const y1 = padding + (buttonSize + gap) * i;
    const y2 = padding + buttonSize * (i + 1) + gap * (i - 1);
    if(offsetY >= y1 && offsetY <= y2) {
      index = i
    }
    if(offsetY < y1) {
      break
    }
  }
  return index
}

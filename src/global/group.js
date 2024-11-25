import luckysheetConfigsetting from "../controllers/luckysheetConfigsetting";
import Store from "../store";

function jfredoPush(oldRowsGroup, oldColsGroup) {
  const rowsGroup = Store.config.rowsGroup || {};
  const colsGroup = Store.config.colsGroup || {};
  const redo = { 
    type: 'updateGroup',
    rowsGroup: oldRowsGroup,
    colsGroup: oldColsGroup,
    curRowsGroup: $.extend(true, {}, rowsGroup),
    curColsGroup: $.extend(true, {}, colsGroup),
  };
  Store.jfredo.push(redo);
}

function getCopyGroup() {
  return {
    rowsGroup: $.extend(true, {}, Store.config?.rowsGroup || {}),
    colsGroup: $.extend(true, {}, Store.config?.colsGroup || {})
  }
}

export function clearGroup() {
  const { rowsGroup, colsGroup } = getCopyGroup();
  Store.config.rowsGroup = {}
  Store.config.colsGroup = {}
  jfredoPush(rowsGroup, colsGroup)
}

export function addRowsGroupItem(s, e, o = 1, histroy = true) {
  if(!Store.config.rowsGroup) {
    Store.config.rowsGroup = {}
  }
  const { rowsGroup, colsGroup } = getCopyGroup();
  const { rowsGroupLevelFlatten } = getGroup();
  // 新增时和之前的分组首位相连
  const chain1 = rowsGroupLevelFlatten.find(i => i.e === s - 1);
  const chain2 = rowsGroupLevelFlatten.find(i => i.s === e + 1);
  const chainGroup = new Array(chain1, chain2).filter(i => !!i);
  if(chainGroup.length) {
    const startPos = chainGroup.map(i => i.s);
    const endPos = chainGroup.map(i => i.e);
    const minStart = Math.min(s, ...startPos);
    const maxEnd = Math.max(e, ...endPos);
    for (const item of chainGroup) {
      delete Store.config.rowsGroup[`${item.s}_${item.e}`];
    }
    Store.config.rowsGroup[`${minStart}_${maxEnd}`] = {s: minStart, e: maxEnd, o: 1}
    
  }else{
    const key = `${s}_${e}`;
    Store.config.rowsGroup[key] = {s, e, o: o >= 1 ? 1 : 0}
  }
  histroy && jfredoPush(rowsGroup, colsGroup)
}

export function addColsGroupItem(s, e, o = 1, histroy = true) {
  if(!Store.config.colsGroup) {
    Store.config.colsGroup = {}
  }
  const { rowsGroup, colsGroup } = getCopyGroup();
  const { colsGroupLevelFlatten } = getGroup();
  // 新增时和之前的分组首位相连
  const chain1 = colsGroupLevelFlatten.find(i => i.e === s - 1);
  const chain2 = colsGroupLevelFlatten.find(i => i.s === e + 1);
  const chainGroup = new Array(chain1, chain2).filter(i => !!i);
  if(chainGroup.length) {
    const startPos = chainGroup.map(i => i.s);
    const endPos = chainGroup.map(i => i.e);
    const minStart = Math.min(s, ...startPos);
    const maxEnd = Math.max(e, ...endPos);
    for (const item of chainGroup) {
      delete Store.config.colsGroup[`${item.s}_${item.e}`];
    }
    Store.config.colsGroup[`${minStart}_${maxEnd}`] = {s: minStart, e: maxEnd, o: 1}
    
  }else{
    const key = `${s}_${e}`;
    Store.config.colsGroup[key] = {s, e, o: o >= 1 ? 1 : 0}
  }
  histroy && jfredoPush(rowsGroup, colsGroup)
}

export function updateGroup(type, data) {
  let d = [];
  if(Array.isArray(data)) {
    d = data.filter(i => typeof i.s === 'number' && typeof i.e === 'number' && typeof i.o === 'number');
  }else{
    const s = data.s;
    const e = data.e;
    const o = data.o;
    if(typeof s === 'number' && typeof e === 'number' && typeof o === 'number') {
      d.push({s, e, o})
    }
  }
  const { rowsGroup, colsGroup } = getCopyGroup();
  for (const { s, e, o } of d) {
    if(type === 'row') {
      addRowsGroupItem(s, e, o, false)
    }else{
      addColsGroupItem(s, e, o, false)
    }
  }
  jfredoPush(rowsGroup, colsGroup)
}

export function deleteRowsGroupItem(s, e) {
  const key = `${s}_${e}`;
  if(Store.config.rowsGroup && key in Store.config.rowsGroup) {
    const { rowsGroup, colsGroup } = getCopyGroup();
    delete Store.config.rowsGroup[key]
    jfredoPush(rowsGroup, colsGroup)
  }
}

export function deleteColsGroupItem(s, e) {
  const key = `${s}_${e}`;
  if(Store.config.colsGroup && key in Store.config.colsGroup) {
    const { rowsGroup, colsGroup } = getCopyGroup();
    delete Store.config.colsGroup[key]
    jfredoPush(rowsGroup, colsGroup)
  }
}

function getLevelGroup(data) {
  // 没有交集 可归为一组
  const result = []
  data.sort((a, b) => (b.e - b.s) - (a.e - a.s))
  for (const item of data) {
    const index = result.findIndex(i => i.every(j => j.e < item.s || j.s > item.e))
    if(index === -1) {
      result.push(new Array({...item}))
    }else{
      result[index].push({...item})
    }
  }
  return {
    levelGroupFlatten: data,
    levelGroup: result.map(i => i.sort((a, b) => a.e - b.e))
  }
}

export function getGroup() {
  if(!Store.config.rowsGroup) {
    Store.config.rowsGroup = {}
  }
  if(!Store.config.colsGroup) {
    Store.config.colsGroup = {}
  }
  const { levelGroupFlatten: rowsGroupLevelFlatten, levelGroup: rowsGroupLevel } = getLevelGroup(Object.values(Store.config.rowsGroup));
  const { levelGroupFlatten: colsGroupLevelFlatten, levelGroup: colsGroupLevel } = getLevelGroup(Object.values(Store.config.colsGroup));
  return {
    rowsGroup: Store.config.rowsGroup,
    colsGroup: Store.config.colsGroup,
    rowsGroupLevel,
    colsGroupLevel,
    rowsGroupLevelFlatten,
    colsGroupLevelFlatten,
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
  const { buttonSize } = getGroupConfig();
  for (let i = 0; i < Store.visibledatarow.length; i++) {
    const rowlen = (Store.config.rowlen?.[i + 1] || luckysheetConfigsetting.defaultRowHeight) * Store.zoomRatio;
    const y1 = Store.visibledatarow[i] + rowlen / 2 - buttonSize / 2;
    const y2 = Store.visibledatarow[i] + rowlen / 2 + buttonSize / 2;

    if(y >= y1 && y <= y2) {
      rows.push(i)
    }
  }
  return rows
}

export function colsOfClickPosition(offsetX) {
  let x = offsetX + $("#luckysheet-cols-h-c").scrollLeft();
  const cols = [];
  const { buttonSize } = getGroupConfig();
  for (let i = 0; i < Store.visibledatacolumn.length; i++) {
    const columnlen = (Store.config.columnlen?.[i + 1] || luckysheetConfigsetting.defaultColWidth) * Store.zoomRatio;
    const x1 = Store.visibledatacolumn[i] + columnlen / 2 - buttonSize / 2;
    const x2 = Store.visibledatacolumn[i] + columnlen / 2 + buttonSize / 2;

    if(x >= x1 && x <= x2) {
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

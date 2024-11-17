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
  }
}

export function getRowGroupLength() {
  const { rowsGroup } = getGroup();
  return Object.values(rowsGroup).length;
}

export function getColGroupLength() {
  const { colsGroup } = getGroup();
  return Object.values(colsGroup).length;
}

export function getRowsGroupAreaWidth() {
  const len = getRowGroupLength()
  const width = len === 0 ? 0 : 20 + len * 10;
  return width * Store.zoomRatio;
}

export function getColsGroupAreaHeight() {
  const len = getColGroupLength()
  const height = len === 0 ? 0 : 20 + len * 10;
  return  height * Store.zoomRatio;
}

export function toggleState(type, index) {
  const { colsGroup, rowsGroup } = getGroup();
  const group = Object.values(type === 'row' ? rowsGroup : colsGroup)[index]
  if(group) {
    const {s, e, o} = group;
    updateGroup(type, `${s}_${e}`, o === 0 ? 1 : 0)
  }
}

export function getGroupConfig() {
  const group = Store.toJsonOptions?.group || {};
  return {
    lineWidth: group.lineWidth || 1,
    strokeStyle: group.strokeStyle || '#bcbdbc',
  }
}
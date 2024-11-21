import Store from "../store";
import { 
    getColsGroupAreaHeight, 
    getGroupConfig, 
    getGroup, 
    rowsOfClickPosition, 
    colsOfClickPosition,
    levelOfRowsGroupClickPosition, 
    levelOfColsGroupClickPosition,
    updateGroup,
    getRowsGroupAreaWidth,
} from "../global/group";
import { jfrefreshgrid_rhcw } from "../global/refresh";

export function groupOperationInitial() {
    // 左上角 行 分组按钮 点击
    $("#luckysheet-rows-group-btns").mousedown(function(event) {
        const offsetX = event.offsetX;
        const offsetY = event.offsetY;
        const bodrder05 = 0.5;
        const { rowsGroupLevel } = getGroup();
        const { buttonSize, gap } = getGroupConfig();
        const colsGroupAreaHeight = getColsGroupAreaHeight();
        const rowsGroupAreaWidth = getRowsGroupAreaWidth();
        const levelLength = rowsGroupLevel.length;
        if(levelLength === 0) return;

        let index = null;
        const padding = (rowsGroupAreaWidth - buttonSize * (levelLength + 1) - gap * levelLength) / 2;
        for (let i = 0; i < levelLength + 1; i++) {
            const x1 = bodrder05 + padding + (buttonSize + gap) * i;
            const x2 = x1 + buttonSize;
            const y1 = colsGroupAreaHeight + Store.columnHeaderHeight / 2 - buttonSize / 2;
            const y2 = y1 + buttonSize;
            if(x1 > offsetX || y1 > offsetY) break
            if(x1 <= offsetX && offsetX <= x2 && y1 <= offsetY && offsetY <= y2) {
                index = i;
            }
        }

        if(index === null) return;

        const data = []
        const openGroup = rowsGroupLevel.slice(0, index);
        const closeGroup = rowsGroupLevel.slice(index);
        for (const group of openGroup) {
            for (const item of group) {
                data.push({...item, o: 1})
            }
        }
        for (const group of closeGroup) {
            for (const item of group) {
                data.push({...item, o: 0})
            }
        }
        updateGroup('row', data);
        jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    })

    // 行分组 线条上按钮 点击
    $("#luckysheet-rows-group").mousedown(function({offsetX, offsetY}) {
        const index = levelOfRowsGroupClickPosition(offsetX);
        if(index === null) return;

        // 存在多行折叠，所以这里的rows是数组
        const rows = rowsOfClickPosition(offsetY)
        const { rowsGroupLevel } = getGroup();

        const level = rowsGroupLevel[index] || [];
        // 处理最后一个按钮的展开或收起 便于层层打开
        const targetGroup = level.reverse().find(i => rows.includes(i.e))
        if(targetGroup) {
            updateGroup('row', {...targetGroup, o: targetGroup.o === 0 ? 1 : 0});
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
    })

    // 左上角 列 分组按钮 点击
    $("#luckysheet-cols-group-btns").mousedown(function(event) {
        const offsetX = event.offsetX;
        const offsetY = event.offsetY;
        const bodrder05 = 0.5;
        const { colsGroupLevel } = getGroup();
        const { buttonSize, gap } = getGroupConfig();
        const colsGroupAreaHeight = getColsGroupAreaHeight();
        const levelLength = colsGroupLevel.length;
        if(levelLength === 0) return;

        let index = null;
        const padding = (colsGroupAreaHeight - buttonSize * (levelLength + 1) - gap * levelLength) / 2;
        for (let i = 0; i < levelLength + 1; i++) {
            const x1 = Store.rowHeaderWidth / 2 - buttonSize / 2;
            const x2 = x1 + buttonSize;
            const y1 = bodrder05 + padding + (buttonSize + gap) * i;
            const y2 = y1 + buttonSize;
            if(x1 > offsetX || y1 > offsetY) break
            if(x1 <= offsetX && offsetX <= x2 && y1 <= offsetY && offsetY <= y2) {
                index = i;
            }
        }

        if(index === null) return;

        const data = []
        const openGroup = colsGroupLevel.slice(0, index);
        const closeGroup = colsGroupLevel.slice(index);
        for (const group of openGroup) {
            for (const item of group) {
                data.push({...item, o: 1})
            }
        }
        for (const group of closeGroup) {
            for (const item of group) {
                data.push({...item, o: 0})
            }
        }
        updateGroup('col', data);
        jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    })

    // 列分组 线条上按钮 点击
    $("#luckysheet-cols-group").mousedown(function({offsetX, offsetY}) {
        const index = levelOfColsGroupClickPosition(offsetY);
        if(index === null) return;

        // 存在多列折叠，所以这里的cols是数组
        const cols = colsOfClickPosition(offsetX)
        const { colsGroupLevel } = getGroup();

        const level = colsGroupLevel[index] || [];
        // 处理最后一个按钮的展开或收起 便于层层打开
        const targetGroup = level.reverse().find(i => cols.includes(i.e))
        if(targetGroup) {
            updateGroup('col', {...targetGroup, o: targetGroup.o === 0 ? 1 : 0});
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
    })
}
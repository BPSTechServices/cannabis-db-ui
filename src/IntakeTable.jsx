import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, FormControlLabel, Switch, Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import './style.css';
import { getIntakeTable, deleteRow, filterIntakeTable, editRow } from './MockApi';
import IntakeTableFilters from './IntakeTableFilters';
import IntakeRowForm from './IntakeRowForm';
import IntakeTableHead from './IntakeTableHead';
import IntakeTableRow from './IntakeTableRow';
import IntakeTableToolbar from './IntakeTableToolbar';

const headers = [
  { id: 'row', numeric: true, label: 'row' },
  { id: 'Submission date', numeric: false, label: 'Submission date' },
  { id: 'Entity', numeric: false, label: 'Entity' },
  { id: 'DBA', numeric: false, label: 'DBA' },
  { id: 'Facility Address', numeric: false, label: 'Facility Address' },
  { id: 'Facility Suite #', numeric: true, label: 'Facility Suite #' },
  { id: 'Facility Zip', numeric: true, label: 'Facility Zip' },
  { id: 'Mailing Address', numeric: false, label: 'Mailing Address' },
  { id: 'MRL', numeric: false, label: 'MRL' },
  { id: 'Neighborhood Association', numeric: false, label: 'Neighborhood Association' },
  { id: 'Compliance Region', numeric: false, label: 'Compliance Region' },
  { id: 'Primary Contact First Name', numeric: false, label: 'Primary Contact First Name' },
  { id: 'Primary Contact Last Name', numeric: false, label: 'Primary Contact Last Name' },
  { id: 'Email', numeric: false, label: 'Email' },
  { id: 'Phone', numeric: false, label: 'Phone' },
  { id: 'Endorse Type', numeric: false, label: 'Endorse Type' },
  { id: 'License Type', numeric: false, label: 'License Type' },
  { id: 'Repeat location?', numeric: false, label: 'Repeat location?' },
  { id: 'App complete?', numeric: false, label: 'App complete?' },
  { id: 'Fee Schedule', numeric: false, label: 'Fee Schedule' },
  { id: 'Receipt No.', numeric: false, label: 'Receipt No.' },
  { id: 'Cash Amount', numeric: false, label: 'Cash Amount' },
  { id: 'Check Amount', numeric: false, label: 'Check Amount' },
  { id: 'Card Amount', numeric: false, label: 'Card Amount' },
  { id: 'Check No. / Approval Code', numeric: true, label: 'Check No. / Approval Code' },
  { id: 'MRL#', numeric: false, label: 'MRL#' },
  { id: 'Notes', numeric: false, label: 'Notes' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  } else if (b[orderBy] > a[orderBy]) {
    return 1;
  } else {
    return 0;
  }
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

export default function IntakeTable() {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('row');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [rows, setRows] = useState([]);

  const getRow = rowNumber => rows.find(row => row['row'] === rowNumber);

  const refreshTable = () => {
    getIntakeTable().then(res => {
      let rows = res.data;
      setRows(rows);
      setSelected([]);
    });
    console.log('table refreshed');
  }

  useEffect(refreshTable, []);

  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = rows.map(row => row["row"]);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  const handleRowClick = (_, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = event => {
    setDense(event.target.checked);
  };

  const isSelected = name => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const onDeleteRows = () => {
    if (selected.length > 0) {
      let deletePromises = [];

      selected.forEach(rowNumber => {
        deletePromises.push(deleteRow(rowNumber).then(res => console.log(res, rowNumber)));
      });

      Promise.all(deletePromises).then(() => {
        console.log(`yeeted rows: ${selected}`);
        setSelected([]);
        refreshTable();
      });
    } else {
      console.log('no rows to yeet');
    }
  };

  const onEditRow = newRow => {
    if (selected.length === 1) {
      editRow(newRow).then(res => console.log(res));
    } else {
      console.log('somehow you selected 0 or more than 1 row to edit');
    }
  }

  const onFilterSubmit = query => {
    filterIntakeTable(query).then(res => {
      console.log('filtered', res);
      setRows(res.data);
    });
  }

  if (rows.length === 0) {
    return (
      <Container maxWidth="lg">
        <IntakeTableToolbar numSelected={selected.length} />
        <Typography variant="body1" align="center">No data found</Typography>
      </Container>
    );
  } else {
    return (
      <Container maxWidth="lg">
        <IntakeTableToolbar
          numSelected={selected.length}
          onDeleteRows={onDeleteRows}
          onEditRow={() => setEditDialogOpen(true)}
          onRefreshTable={refreshTable} />
        <IntakeTableFilters onSubmit={onFilterSubmit} />
        <TableContainer>
          <Table
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="Data table"
          >
            <IntakeTableHead
              headers={headers}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) =>
                  <IntakeTableRow
                    key={index}
                    onRowClick={event => handleRowClick(event, row["row"])}
                    isRowSelected={isSelected(row["row"])}
                    index={index}
                    row={row}
                  />
                )}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
        <IntakeRowForm
          isDialog={true}
          row={getRow(selected[0])}
          dialogOpen={editDialogOpen}
          onDialogClose={() => setEditDialogOpen(false)}
          onSubmit={onEditRow}
        ></IntakeRowForm>
      </Container>
    );
  }
}

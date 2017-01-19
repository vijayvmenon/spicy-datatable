/**
 * @fileoverview SpicyDatatable
 * Main entry file for `spicy-datatable` package. Renders a tabele given a tableKey, columns, and rows prop.
 * For complete documentation of how to use this, refer to the `README.md` or check out the examples in `App.ja`
 */
import React, { Component, PropTypes } from 'react';
import Pagination from './Pagination.js';
import DatatableOptions from './DatatableOptions.js';
import { filterRows, getSafely, setSafely } from './utils.js';
import style from './table.css';

const miniCache = {};

class SpicyDatatable extends Component {

  static propTypes = {
    tableKey: PropTypes.string.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
    })).isRequired,
    rows: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      itemsPerPage: getSafely(miniCache, props.tableKey).itemsPerPage || 10,
      currentPage: getSafely(miniCache, props.tableKey).currentPage || 1,
      searchQuery: getSafely(miniCache, props.tableKey).searchQuery || '',
    };
  }

  render() {
    const { itemsPerPage, currentPage, searchQuery } = this.state;
    const { columns, rows: originalRows } = this.props;
    const isFilterActive = searchQuery.length > 0;
    const filteredRows = isFilterActive ? this.state.filteredRows : originalRows;
    const maxOnPage = currentPage * itemsPerPage;
    const rows = filteredRows.slice((currentPage - 1) * itemsPerPage, maxOnPage);
    const total = isFilterActive ? filteredRows.length : originalRows.length;
    const fromEntries = ((currentPage - 1) * itemsPerPage) + 1;
    const toEntries = maxOnPage > total ? total : maxOnPage;

    return (
      <div>
        <DatatableOptions
          onPageSizeChange={this.handlePageSizeChange.bind(this)}
          onSearch={this.handleSearchQueryChange.bind(this)}
        />
        <table className="spicy-datatable">
          <thead>
            <tr>
              {columns.map(c =>
                <th key={c.key}>
                  {c.label}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) =>
              <tr
                key={i}
                onClick={r.onClickHandler ? r.onClickHandler : () => undefined}
                style={{ cursor: r.onClickHandler ? 'pointer' : 'default' }}
                className={r.isActive ? 'spicy-datatable--selected-row' : ''}
              >
                {columns.map((c, i) =>
                  <td key={i}>
                    {r[c.key]}
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>
        <div className="spicy-datatable-counter">
          {total > 0 ?
            <p>Showing {fromEntries} to {toEntries} of {total} entries.</p> : <p>No entries to show.</p>}
        </div>
        <Pagination
          onPage={this.handlePagination.bind(this)}
          itemsPerPage={itemsPerPage}
          total={total}
          activePage={currentPage}
        />
      </div>
    );
  }

  handlePagination(nextPage) {
    const { tableKey } = this.props;
    this.setState({
      currentPage: nextPage,
    });
    setSafely(miniCache, tableKey, 'currentPage', nextPage);
  }

  handleSearchQueryChange(e) {
    const { columns, rows } = this.props;
    const { value } = e.target;
    const { tableKey } = this.props;
    if (this.scheduleQueryChange) {
      clearTimeout(this.scheduleQueryChange);
    }
    this.scheduleQueryChange = setTimeout(() => {
      const filteredRows = value.length === 0 ? [] : filterRows(rows, columns, value);
      this.setState({ filteredRows, searchQuery: value, currentPage: 1 });
      setSafely(miniCache, tableKey, 'searchQuery', value);
      setSafely(miniCache, tableKey, 'currentPage', 1);
    }, 200);
  }

  handlePageSizeChange(e) {
    const { value } = e.target;
    const { tableKey } = this.props;
    this.setState({ itemsPerPage: Number(value), currentPage: 1 });
    setSafely(miniCache, tableKey, 'itemsPerPage', Number(value));
    setSafely(miniCache, tableKey, 'currentPage', 1);
  }
}

export default SpicyDatatable;

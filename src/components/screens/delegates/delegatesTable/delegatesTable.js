import React from 'react';
import { getTotalVotesCount } from '../../../../utils/voting';
import FirstTimeVotingOverlay from './firstTimeVotingOverlay';
import styles from './delegatesTable.css';
import voteFilters from '../../../../constants/voteFilters';
import votingConst from '../../../../constants/voting';
import withDelegatesData from './withDelegatesData';
import Box from '../../../toolbox/box';
import BoxHeader from '../../../toolbox/box/header';
import BoxContent from '../../../toolbox/box/content';
import BoxTabs from '../../../toolbox/tabs';
import { Input } from '../../../toolbox/inputs';
import Table from '../../../toolbox/table';
import DelegateRow from './delegateRow';
import header from './tableHeader';

const DelegatesTableMain = ({
  delegates, tabs, t, filters, applyFilters, firstTimeVotingActive,
  shouldShowVoteColumn, votingModeEnabled, onRowClick,
}) => {
  console.log('----------', onRowClick);
  const handleLoadMore = () => {
    delegates.loadData(Object.keys(filters).reduce((acc, key) => ({
      ...acc,
      ...(filters[key] && { [key]: filters[key] }),
    }), {
      offset: delegates.data.length,
    }));
  };

  const handleFilter = ({ target: { value } }) => {
    applyFilters({
      ...filters,
      search: value,
    });
  };

  return (
    <Box main isLoading={delegates.isLoading}>
      <BoxHeader className="delegates-table">
        {tabs.tabs.length === 1
          ? <h2>{tabs.tabs[0].name}</h2>
          : <BoxTabs {...tabs} />
        }
        <span>
          <Input
            onChange={handleFilter}
            value={filters.search}
            className="filter-by-name"
            size="xs"
            placeholder={t('Filter by name...')}
          />
        </span>
      </BoxHeader>
      <BoxContent className={styles.content}>
        <Table
          data={delegates.data}
          isLoading={delegates.isLoading}
          row={props => (
            <DelegateRow
              {...props}
              firstTimeVotingActive={firstTimeVotingActive}
              shouldShowVoteColumn={shouldShowVoteColumn}
              votingModeEnabled={votingModeEnabled}
              onRowClick={onRowClick}
            />
          )}
          loadData={handleLoadMore}
          header={header(shouldShowVoteColumn, t)}
          canLoadMore
          error={delegates.error}
          iterationKey="username"
        />
      </BoxContent>
    </Box>
  );
};

const DelegatesTable = ({
  t, delegates, filters, applyFilters, votingModeEnabled, votes, voteToggled, account,
}) => {
  const shouldShowVoteColumn = votingModeEnabled || getTotalVotesCount(votes) > 0;
  const firstTimeVotingActive = votingModeEnabled && getTotalVotesCount(votes) === 0;

  const tabs = {
    tabs: [{
      name: t('All delegates'),
      value: voteFilters.all,
      className: 'all-delegates',
    },
    ...(account.address ? [{
      name: t('Voted'),
      value: voteFilters.voted,
      className: 'voted',
    }, {
      name: t('Not voted'),
      value: voteFilters.notVoted,
      className: 'not-voted',
    }] : []),
    ],
    active: filters.tab,
    onClick: ({ value }) => applyFilters({ tab: value }),
  };

  const onRowClick = votingModeEnabled ? voteToggled : undefined;
  const canLoadMore = delegates.data.length >= votingConst.numberOfActiveDelegates;

  return (
    <FirstTimeVotingOverlay enabled={firstTimeVotingActive}>
      <DelegatesTableMain {...{
        delegates,
        tabs,
        applyFilters,
        filters,
        onRowClick,
        canLoadMore,
        t,
        firstTimeVotingActive,
        shouldShowVoteColumn,
        votingModeEnabled,
      }}
      />
    </FirstTimeVotingOverlay>
  );
};

export default withDelegatesData()(DelegatesTable);

import { Link } from 'react-router-dom';
import React from 'react';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import { DateTimeFromTimestamp } from '../../../toolbox/timestamp';
import Box from '../../../toolbox/box';
import Feedback from '../../../toolbox/feedback/feedback';
import LiskAmount from '../../../shared/liskAmount';
import PageLayout from '../../../toolbox/pageLayout';
import CopyToClipboard from '../../../toolbox/copyToClipboard';
import routes from '../../../../constants/routes';
import TableRow from '../../../toolbox/table/tableRow';
import AccountVisual from '../../../toolbox/accountVisual';
import Icon from '../../../toolbox/icon';
import styles from './blockDetails.css';

const columnClassNames = {
  sender: `${grid['col-md-3']} ${grid['col-xs-3']}`,
  recipient: `${grid['col-md-3']} ${grid['col-xs-3']}`,
  date: `${grid['col-md-2']} hidden-m`,
  amount: grid['col-xs-2'],
  fee: grid['col-xs-1'],
  status: grid['col-xs-1'],
};

const BlockDetails = ({ t, blockDetails, blockTransactions }) => (
  <PageLayout>
    <Box isLoading={blockDetails.isLoading} width="full">
      <Box.Header>
        <h1>{t('Block details')}</h1>
      </Box.Header>
      {
        blockDetails.error
          ? (
            <Box.Content>
              <Feedback status="error" show>{t('Failed to load block details.')}</Feedback>
            </Box.Content>
          )
          : (
            <React.Fragment>
              <div>
                <Box.Row>
                  <div className={styles.dataContainer}>
                    <label>{t('Block ID')}</label>
                    <span>
                      <CopyToClipboard value={blockDetails.data.id} />
                    </span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Height')}</label>
                    <span>
                      <CopyToClipboard value={blockDetails.data.height} />
                    </span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Version')}</label>
                    <span>{blockDetails.data.version}</span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Confirmations')}</label>
                    <span>{blockDetails.data.confirmations}</span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Reward')}</label>
                    <span>
                      <LiskAmount val={blockDetails.data.reward} />
                      &nbsp;
                      {t('LSK')}
                    </span>
                  </div>
                </Box.Row>

                <Box.Row>
                  <div className={styles.dataContainer}>
                    <label>{t('Total fee')}</label>
                    <span>
                      <LiskAmount val={blockDetails.data.totalFee} />
                      &nbsp;
                      {t('LSK')}
                    </span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Total forged')}</label>
                    <span>
                      <LiskAmount val={blockDetails.data.totalForged} />
                      &nbsp;
                      {t('LSK')}
                    </span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Total amount')}</label>
                    <span>
                      <LiskAmount val={blockDetails.data.totalAmount} />
                      &nbsp;
                      {t('LSK')}
                    </span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Date')}</label>
                    <span>
                      <DateTimeFromTimestamp time={blockDetails.data.timestamp * 1000} token="BTC" />
                    </span>
                  </div>

                  <div className={styles.dataContainer}>
                    <label>{t('Generated by')}</label>
                    <span>
                      <Link to={`${routes.accounts.path}/${blockDetails.data.generatorAddress}`}>
                        {blockDetails.data.generatorUsername}
                      </Link>
                    </span>
                  </div>
                </Box.Row>
              </div>
            </React.Fragment>
          )
      }
    </Box>

    <Box isLoading={blockTransactions.isLoading} width="full">
      <Box.Header>
        <h2>{t('Transactions')}</h2>
      </Box.Header>
      {
        blockTransactions.error
          ? (
            <Box.Content>
              <Feedback status="error" show>{t('There are nor transactions for this block.')}</Feedback>
            </Box.Content>
          )
          : (
            <React.Fragment>
              <div>
                {
                  Array.isArray(blockTransactions.data)
                    ? (
                      <TableRow isHeader className={`${grid.row}`}>
                        <div className={`${columnClassNames.sender} ${styles.defaultHeader}`}>{t('Sender')}</div>
                        <div className={columnClassNames.recipient}>{t('Recipient')}</div>
                        <div className={columnClassNames.date}>{t('Date')}</div>
                        <div className={columnClassNames.amount}>{t('Amount')}</div>
                        <div className={columnClassNames.fee}>{t('Fee')}</div>
                        <div className={columnClassNames.status}>{t('Status')}</div>
                      </TableRow>
                    )
                    : ''
                }
                {
                  Array.isArray(blockTransactions.data)
                    ? blockTransactions.data.map(blockTransaction => (
                      <TableRow key={blockTransaction.id} className={`${grid.row}`}>
                        <span className={[columnClassNames.sender, 'sender'].join(' ')}>
                          <AccountVisual address={blockTransaction.senderId} size={30} />
                          &nbsp;
                          {blockTransaction.senderId}
                        </span>
                        <span className={[columnClassNames.recipient, 'recipient'].join(' ')}>
                          <AccountVisual address={blockTransaction.recipientId} size={30} />
                          &nbsp;
                          {blockTransaction.recipientId}
                        </span>
                        <span className={[columnClassNames.date, 'date'].join(' ')}>
                          <DateTimeFromTimestamp time={blockTransaction.timestamp * 1000} token="BTC" />
                        </span>
                        <span className={[columnClassNames.amount, 'amount'].join(' ')}>
                          <LiskAmount val={blockTransaction.amount} />
                          &nbsp;
                          {t('LSK')}
                        </span>
                        <span className={[columnClassNames.fee, 'fee'].join(' ')}>
                          <LiskAmount val={blockTransaction.fee} />
                          &nbsp;
                          {t('LSK')}
                        </span>
                        <span className={[columnClassNames.status, 'status'].join(' ')}>
                          <Icon name={blockTransaction.confirmations >= 101 ? 'transactionApproved' : 'transactionPending'} />
                        </span>
                      </TableRow>
                    ))
                    : ''
                }
              </div>
            </React.Fragment>
          )
      }
    </Box>
  </PageLayout>
);

export default BlockDetails;

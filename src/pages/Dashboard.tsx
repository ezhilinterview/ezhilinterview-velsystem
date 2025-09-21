import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Wallet,
  Banknote,
  ArrowUpDown,
  DollarSign,
  Edit,
  Trash2,
} from 'lucide-react';
import { useFormatters } from '../hooks/useFormatters';
import { useRecentTransactions, useTransactionSummary } from '../hooks/useDashboard';
import { useDeleteTransaction } from '../hooks/useTransactions';
import { useAccountSummary } from '../hooks/useAccounts';
import { TRANSACTION_TYPES } from '../types/transaction';
import { DEBT_TRANSACTION_TYPES } from '../types/debt';
import CategoryIcon from '../components/CategoryIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { Link } from 'react-router-dom';

const summaryTabs = ['All Time', 'Month', 'Year'];

function Dashboard() {
  const [activeSummaryTab, setActiveSummaryTab] = useState(0);
  const [transactionToDelete, setTransactionToDelete] = useState<{ id: string; description: string } | null>(null);
  
  const { formatCurrency } = useFormatters();
  const { data: recentTransactions = [], isLoading: recentLoading } = useRecentTransactions();
  const { data: summary, isLoading: summaryLoading } = useTransactionSummary((activeSummaryTab + 1) as 1 | 2 | 3);
  const { data: accountSummary, isLoading: accountLoading } = useAccountSummary();
  const deleteTransaction = useDeleteTransaction();

  const handleDeleteTransaction = async () => {
    if (transactionToDelete) {
      await deleteTransaction.mutateAsync(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const getTransactionIcon = (type: number) => {
    if (type === 1) return <TrendingDown className="w-5 h-5 text-red-600" />;
    if (type === 2) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (type === 3) return <ArrowUpDown className="w-5 h-5 text-blue-600" />;
    if (type === 5) return <TrendingDown className="w-5 h-5 text-red-600" />;
    if (type === 6) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (type === 7) return <DollarSign className="w-5 h-5 text-blue-600" />;
    return <DollarSign className="w-5 h-5 text-gray-600" />;
  };

  const getAmountColor = (type: number) => {
    if (type === 1 || type === 5) return 'text-red-600';
    if (type === 2 || type === 6) return 'text-green-600';
    if (type === 3 || type === 7) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getAccountIcon = (type: number) => {
    switch (type) {
      case 1: return <Building2 className="w-4 h-4 text-blue-600" />;
      case 2: return <Wallet className="w-4 h-4 text-green-600" />;
      case 3: return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 4: return <Banknote className="w-4 h-4 text-yellow-600" />;
      default: return <Building2 className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString();
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const formattedTime = `${displayHour}:${minutes.padStart(2, '0')} ${period}`;
    return { date: formattedDate, time: formattedTime };
  };

  const getTransactionTypeName = (type: number) => {
    if (type >= 5 && type <= 7) {
      return DEBT_TRANSACTION_TYPES[type as keyof typeof DEBT_TRANSACTION_TYPES];
    }
    return TRANSACTION_TYPES[type.toString() as keyof typeof TRANSACTION_TYPES];
  };

  const balance = (summary?.totalIncome || 0) - (summary?.totalExpense || 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your expenses and financial goals
          </p>
        </div>
      {/* Summary Tabs */}
      <div className="flex justify-evenly gap-2 bg-gray-100 rounded-full p-1 sm:w-fit mb-4">
        {summaryTabs.map((tab, index) => {
          const active = activeSummaryTab === index;
          return (
            <button
              key={tab}
              onClick={() => setActiveSummaryTab(index)}
              className={`px-4 w-full py-2 rounded-full text-sm font-medium transition ${
                active
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.totalExpense || 0)}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalIncome || 0)}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance >= 0 ? '+' : ''}{formatCurrency(Math.abs(balance))}
                </p>
              </div>
              <div className={`rounded-full p-3 ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Summary */}
      {accountLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Available Balance</h3>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(accountSummary?.availableAmount || 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Available Credit</h3>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(accountSummary?.availableCredit || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link
            to="/transactions"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {recentLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <ArrowUpDown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start tracking your finances by adding your first transaction</p>
            <Link
              to="/transactions/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Add Transaction
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentTransactions.slice(0, 6).map((transaction) => {
              const { date, time } = formatDateTime(transaction.txnDate, transaction.txnTime);
              return (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {transaction.category ? (
                      <CategoryIcon
                        icon={transaction.category.icon}
                        color={transaction.category.color}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getTransactionTypeName(transaction.type)}
                        {transaction.category && ` • ${transaction.category.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-semibold ${getAmountColor(transaction.type)}`}>
                      {(transaction.type === 1 || transaction.type === 5) ? '-' :
                        (transaction.type === 2 || transaction.type === 6) ? '+' : ''}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/transactions/edit/${transaction.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setTransactionToDelete({
                          id: transaction.id,
                          description: transaction.description
                        })}
                        disabled={deleteTransaction.isPending}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1 mt-2">
                    <div>{date} at {time}</div>

                    {/* Transfer specific info */}
                    {transaction.type === 3 && transaction.fromAccount && transaction.toAccount && (
                      <div className="flex items-center gap-1">
                        {getAccountIcon(transaction.fromAccount.type)}
                        <span>{transaction.fromAccount.name}</span>
                        <ArrowUpDown className="w-3 h-3 mx-1" />
                        {getAccountIcon(transaction.toAccount.type)}
                        <span>{transaction.toAccount.name}</span>
                      </div>
                    )}

                    {/* Debt specific info */}
                    {transaction.debt && (
                      <div className="text-gray-400">
                        Debt: {transaction.debt.personName}
                      </div>
                    )}

                    {/* Account info for non-transfer */}
                    {transaction.type !== 3 && transaction.account && (
                      <div className="flex items-center gap-1">
                        {getAccountIcon(transaction.account.type)}
                        <span>{transaction.account.name}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {transaction.tags && transaction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {transaction.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {transaction.tags.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{transaction.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${transactionToDelete?.description}" transaction? This action cannot be undone.`}
        confirmText="Delete Transaction"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isPending={deleteTransaction.isPending}
      />
    </div>
  );
}

export default Dashboard;
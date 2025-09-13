import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Play, Pause, Calendar, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { 
  useUpcomingScheduledTransactions, 
  useCompletedScheduledTransactions,
  useDeleteScheduledTransaction,
  useToggleScheduledTransaction
} from '../hooks/useScheduledTransactions';
import { SCHEDULED_TRANSACTION_TYPES, FREQUENCY_OPTIONS } from '../types/scheduledTransaction';
import { useFormatters } from '../hooks/useFormatters';
import CategoryIcon from '../components/CategoryIcon';
import ConfirmationModal from '../components/ConfirmationModal';

const tabs = ['Upcoming', 'Completed'];

function ScheduledTransactions() {
  const [activeTab, setActiveTab] = useState(0);
  const [transactionToDelete, setTransactionToDelete] = useState<{ id: string; description: string } | null>(null);

  const { data: upcomingTransactions = [], isLoading: upcomingLoading } = useUpcomingScheduledTransactions();
  const { data: completedTransactions = [], isLoading: completedLoading } = useCompletedScheduledTransactions();
  const deleteTransaction = useDeleteScheduledTransaction();
  const toggleTransaction = useToggleScheduledTransaction();
  const { formatCurrency } = useFormatters();

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 1:
        return { data: completedTransactions, isLoading: completedLoading };
      default:
        return { data: upcomingTransactions, isLoading: upcomingLoading };
    }
  };

  const { data: transactions, isLoading } = getCurrentData();

  const handleDeleteTransaction = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction.mutateAsync(transactionToDelete.id);
        setTransactionToDelete(null);
      } catch (error) {
        console.error('Failed to delete scheduled transaction:', error);
      }
    }
  };

  const handleToggleTransaction = async (id: string) => {
    try {
      await toggleTransaction.mutateAsync(id);
    } catch (error) {
      console.error('Failed to toggle scheduled transaction:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'INCOME':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'TRANSFER':
        return <ArrowUpDown className="w-5 h-5 text-blue-600" />;
      default:
        return <ArrowUpDown className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return 'text-red-600';
      case 'INCOME':
        return 'text-green-600';
      case 'TRANSFER':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scheduled Transactions</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Set up recurring income and expenses</p>
        </div>
        <Link
          to="/scheduled/add"
          className="mt-3 sm:mt-0 inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          Add Scheduled Transaction
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4 sm:mb-6">
        {tabs.map((tab, index) => {
          const active = activeTab === index;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`flex-1 text-xs sm:text-sm font-medium rounded-lg py-2 transition-all duration-200 ${
                active
                  ? "bg-white shadow text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {tabs[activeTab]} Transactions ({transactions.length})
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No {tabs[activeTab].toLowerCase()} scheduled transactions
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
              {activeTab === 0 
                ? 'Create your first scheduled transaction to automate recurring expenses and income'
                : 'No completed scheduled transactions yet'
              }
            </p>
            {activeTab === 0 && (
              <Link
                to="/scheduled/add"
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Add Scheduled Transaction
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-3 sm:p-4 lg:p-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {transaction.category ? (
                      <CategoryIcon
                        icon={transaction.category.icon}
                        color={transaction.category.color}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex-shrink-0">
                        {SCHEDULED_TRANSACTION_TYPES[transaction.type]}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 lg:space-x-4 text-xs sm:text-sm text-gray-500">
                      <span>Start: {formatDate(transaction.startDate)} at {formatTime(transaction.time)}</span>
                      <span className="hidden sm:inline">• {FREQUENCY_OPTIONS[transaction.frequencyType]}</span>
                      {transaction.remainderDays && transaction.remainderDays > 0 && (
                        <span className="hidden md:inline">• {transaction.remainderDays} day(s) reminder</span>
                      )}
                      {(transaction.account || transaction.fromAccount) && (
                        <span className="hidden lg:inline">
                          • {transaction.account?.name || transaction.fromAccount?.name}
                          {transaction.type === 'TRANSFER' && transaction.toAccount && 
                            ` → ${transaction.toAccount.name}`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                  <div className="text-right">
                    <p className={`text-sm sm:text-base font-semibold ${getAmountColor(transaction.type)}`}>
                      {transaction.type === 'EXPENSE' ? '-' : transaction.type === 'INCOME' ? '+' : ''}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleToggleTransaction(transaction.id)}
                      disabled={toggleTransaction.isPending}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50 rounded-md hover:bg-gray-50"
                      title={transaction.status === 'UPCOMING' ? 'Pause' : 'Resume'}
                    >
                      {transaction.status === 'UPCOMING' ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                    <Link
                      to={`/scheduled/edit/${transaction.id}`}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <button
                      onClick={() => setTransactionToDelete({ id: transaction.id, description: transaction.description })}
                      disabled={deleteTransaction.isPending}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 rounded-md hover:bg-gray-50"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleDeleteTransaction}
        title="Delete Scheduled Transaction"
        message={`Are you sure you want to delete "${transactionToDelete?.description}" scheduled transaction? This action cannot be undone.`}
        confirmText="Delete Transaction"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isPending={deleteTransaction.isPending}
      />
    </div>
  );
}

export default ScheduledTransactions;
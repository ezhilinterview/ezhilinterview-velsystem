import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calculator as CalculatorIcon, TrendingDown, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useCreateTransaction,
  useUpdateTransaction,
  useTransaction
} from '../hooks/useTransactions';
import {
  useCategoriesByType,
  useDefaultCategory
} from '../hooks/useCategories';
import {
  useAccounts,
  useDefaultPaymentMode
} from '../hooks/useAccounts';
import { CreateTransactionData } from '../types/transaction';
import CalculatorModal from '../components/CalculatorModal';
import CategorySelectModal from '../components/CategorySelectModal';
import AccountSelectModal from '../components/AccountSelectModal';
import CategoryIcon from '../components/CategoryIcon';

const transactionTypes = [
  {
    id: 0,
    type: 1,
    name: 'Expense',
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Money going out'
  },
  {
    id: 1,
    type: 2,
    name: 'Income',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Money coming in'
  },
  {
    id: 2,
    type: 3,
    name: 'Transfer',
    icon: ArrowUpDown,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Move between accounts'
  }
];

interface FormData {
  type: 1 | 2 | 3;
  date: string;
  time: string;
  amount: number;
  categoryId?: string;
  accountId: string;
  fromAccountId?: string;
  toAccountId?: string;
  paymentModeId?: string;
  fromPaymentModeId?: string;
  toPaymentModeId?: string;
  description: string;
  tags: string[];
}

function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const defaultTags = ['vacation', 'needs', 'business', 'food', 'shopping', 'entertainment', 'health', 'transportation'];
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isToAccountModalOpen, setIsToAccountModalOpen] = useState(false);
  const [isFromAccountModalOpen, setIsFromAccountModalOpen] = useState(false);

  const { data: transaction, isLoading: transactionLoading } = useTransaction(id || '');
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  // Get categories and accounts
  const currentType = activeTab === 0 ? 1 : activeTab === 1 ? 2 : 1; // For transfer, use expense categories
  const { data: categories = [] } = useCategoriesByType(currentType);
  const { data: defaultCategory } = useDefaultCategory(currentType);
  const { data: accounts = [] } = useAccounts();
  const { data: defaultPaymentMode } = useDefaultPaymentMode();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      amount: 0,
      categoryId: '',
      accountId: '',
      toAccountId: '',
      fromAccountId: '',
      paymentModeId: '',
      fromPaymentModeId: '',
      toPaymentModeId: '',
      description: '',
      tags: []
    }
  });

  const watchedValues = watch();
  const selectedCategory = categories.find(cat => cat.id === watchedValues.categoryId);
  const selectedAccount = accounts.find(acc => acc.id === watchedValues.accountId);
  const selectedToAccount = accounts.find(acc => acc.id === watchedValues.toAccountId);
  const selectedPaymentMode = selectedAccount?.linkedPaymentModes?.find(pm => pm.id === watchedValues.paymentModeId);

  // Load existing transaction data for editing
  useEffect(() => {
    if (isEditing && transaction) {
      const transactionType = transaction.type;
      setActiveTab(transactionType === 1 ? 0 : transactionType === 2 ? 1 : 2);
      setValue('type', transactionType);
      setValue('date', transaction.txnDate);
      setValue('time', transaction.txnTime.slice(0, 5)); // Remove seconds
      setValue('amount', transaction.amount);
      setValue('categoryId', transaction.category?.id || '');
      setValue('accountId', transaction.account?.id || '');
      setValue('toAccountId', transaction.toAccount?.id || '');
      setValue('fromAccountId', transaction.fromAccount?.id || '');
      setValue('paymentModeId', transaction.paymentMode?.id || '');
      setValue('description', transaction.description);
      setValue('tags', transaction.tags?.map(tag => tag.name) || []);
    }
  }, [isEditing, transaction, setValue]);

  // Set defaults when not editing
  useEffect(() => {
    if (!isEditing) {
      if (defaultCategory && activeTab !== 2) {
        setValue('categoryId', defaultCategory.id);
      }

      if (defaultPaymentMode) {
        setValue('accountId', defaultPaymentMode.id);
      }
    }
  }, [defaultCategory, defaultPaymentMode, activeTab, isEditing, setValue]);

  // Update form type when tab changes
  useEffect(() => {
    const newType = activeTab === 0 ? 1 : activeTab === 1 ? 2 : 3;
    setValue('type', newType);

    // Clear category for transfer
    if (activeTab === 2) {
      setValue('categoryId', '');
    } else if (defaultCategory) {
      setValue('categoryId', defaultCategory.id);
    }
  }, [activeTab, setValue, defaultCategory]);

  const onSubmit = async (data: FormData) => {
    try {
      const transactionData: CreateTransactionData = {
        type: data.type,
        txnDate: data.date,
        txnTime: data.time,
        amount: data.amount,
        categoryId: data.type === 3 ? undefined : data.categoryId,
        accountId: data.accountId,
        toAccountId: data.type === 3 ? data.toAccountId : undefined,
        paymentModeId: data.type === 3 ? data.fromPaymentModeId : data.paymentModeId,
        toPaymentModeId: data.type === 3 ? data.toPaymentModeId : undefined,
        description: data.description,
        tags: data.tags
      };

      const transactionType = data.type === 1 ? 'expense' : data.type === 2 ? 'income' : 'transfer';

      if (isEditing && id) {
        await updateTransaction.mutateAsync({
          id,
          data: transactionData,
          transactionType
        });
      } else {
        await createTransaction.mutateAsync({
          ...transactionData,
          transactionType
        });
      }
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const handleAmountChange = (amount: number) => {
    setValue('amount', amount);
  };

  const toggleTag = (tag: string) => {
    const currentTags = watch('tags');
    if (currentTags.includes(tag)) {
      setValue('tags', currentTags.filter(t => t !== tag));
    } else {
      setValue('tags', [...currentTags, tag]);
    }
  };

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  if (isEditing && transactionLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Transactions
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {isEditing ? 'Update transaction details' : 'Record a new financial transaction'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {transactionTypes.map((txnType) => {
              const isActive = activeTab === txnType.id;
              const IconComponent = txnType.icon;
              
              return (
                <button
                  key={txnType.id}
                  type="button"
                  onClick={() => setActiveTab(txnType.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isActive
                      ? `${txnType.borderColor} ${txnType.bgColor}`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white' : 'bg-gray-100'}`}>
                      <IconComponent className={`w-5 h-5 ${isActive ? txnType.color : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isActive ? txnType.color : 'text-gray-900'}`}>
                        {txnType.name}
                      </h3>
                      <p className="text-xs text-gray-500">{txnType.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date, Time & Amount */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                {...register('date', { required: 'Date is required' })}
                type="date"
                id="date"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                {...register('time', { required: 'Time is required' })}
                type="time"
                id="time"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              {errors.time && (
                <p className="mt-1 text-xs text-red-600">{errors.time.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center transition-colors"
                >
                  <CalculatorIcon className="w-3 h-3 mr-1" />
                  Calculator
                </button>
              </div>
              <input
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                type="number"
                step="0.01"
                id="amount"
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Category Section (for Expense and Income) */}
        {activeTab !== 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Category</h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                {selectedCategory ? 'Change' : 'Select'}
              </button>
            </div>

            {selectedCategory ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <CategoryIcon icon={selectedCategory.icon} color={selectedCategory.color} size="md" />
                <div>
                  <h3 className="font-medium text-gray-900">{selectedCategory.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedCategory.type === 1 ? 'Expense' : 'Income'} Category
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-sm">No category selected</p>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Select Category
                </button>
              </div>
            )}
          </div>
        )}

        {/* Account Section */}
        {activeTab !== 2 ? (
          // Single Account for Expense/Income
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(true)}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                {selectedAccount ? 'Change' : 'Select'}
              </button>
            </div>

            {selectedAccount ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-lg">
                      {selectedAccount.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedAccount.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedAccount.type === 1 ? 'Bank Account' : 
                       selectedAccount.type === 2 ? 'Wallet' :
                       selectedAccount.type === 3 ? 'Credit Card' : 'Cash'}
                    </p>
                  </div>
                </div>

                {/* Payment Mode Selection */}
                {selectedAccount.linkedPaymentModes && selectedAccount.linkedPaymentModes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Mode <span className="text-gray-400">(Optional)</span>
                    </label>
                    {selectedPaymentMode ? (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <span className="text-blue-600 text-sm font-medium">PM</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedPaymentMode.name}</p>
                          <p className="text-sm text-gray-500">
                            {selectedPaymentMode.type === 1 ? 'UPI' :
                             selectedPaymentMode.type === 2 ? 'Debit Card' :
                             selectedPaymentMode.type === 3 ? 'Cheque' : 'Internet Banking'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setValue('paymentModeId', '')}
                          className="ml-auto text-gray-400 hover:text-gray-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedAccount.linkedPaymentModes.map((paymentMode) => (
                          <button
                            key={paymentMode.id}
                            type="button"
                            onClick={() => setValue('paymentModeId', paymentMode.id)}
                            className="p-3 text-left border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900">{paymentMode.name}</p>
                            <p className="text-xs text-gray-500">
                              {paymentMode.type === 1 ? 'UPI' :
                               paymentMode.type === 2 ? 'Debit Card' :
                               paymentMode.type === 3 ? 'Cheque' : 'Internet Banking'}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <p className="text-gray-500 text-sm">No account selected</p>
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Select Account
                </button>
              </div>
            )}
          </div>
        ) : (
          // Transfer Accounts
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer Accounts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* From Account */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    From Account
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsFromAccountModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center transition-colors"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {selectedAccount ? 'Change' : 'Select'}
                  </button>
                </div>

                {selectedAccount ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">
                          {selectedAccount.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{selectedAccount.name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {selectedAccount.type === 1 ? 'Bank Account' : 
                           selectedAccount.type === 2 ? 'Wallet' :
                           selectedAccount.type === 3 ? 'Credit Card' : 'Cash'}
                        </p>
                      </div>
                    </div>

                    {/* From Payment Mode */}
                    {selectedAccount.linkedPaymentModes && selectedAccount.linkedPaymentModes.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Payment Mode (Optional)
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedAccount.linkedPaymentModes.map((paymentMode) => (
                            <button
                              key={paymentMode.id}
                              type="button"
                              onClick={() => setValue('fromPaymentModeId', paymentMode.id)}
                              className={`p-2 text-left border rounded-lg transition-colors text-xs ${
                                watchedValues.fromPaymentModeId === paymentMode.id
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <p className="font-medium text-gray-900">{paymentMode.name}</p>
                              <p className="text-gray-500">
                                {paymentMode.type === 1 ? 'UPI' :
                                 paymentMode.type === 2 ? 'Debit Card' :
                                 paymentMode.type === 3 ? 'Cheque' : 'Internet Banking'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <p className="text-gray-500 text-xs">No account selected</p>
                  </div>
                )}
              </div>

              {/* To Account */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    To Account
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsToAccountModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center transition-colors"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {selectedToAccount ? 'Change' : 'Select'}
                  </button>
                </div>

                {selectedToAccount ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">
                          {selectedToAccount.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{selectedToAccount.name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {selectedToAccount.type === 1 ? 'Bank Account' : 
                           selectedToAccount.type === 2 ? 'Wallet' :
                           selectedToAccount.type === 3 ? 'Credit Card' : 'Cash'}
                        </p>
                      </div>
                    </div>

                    {/* To Payment Mode */}
                    {selectedToAccount.linkedPaymentModes && selectedToAccount.linkedPaymentModes.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Payment Mode (Optional)
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedToAccount.linkedPaymentModes.map((paymentMode) => (
                            <button
                              key={paymentMode.id}
                              type="button"
                              onClick={() => setValue('toPaymentModeId', paymentMode.id)}
                              className={`p-2 text-left border rounded-lg transition-colors text-xs ${
                                watchedValues.toPaymentModeId === paymentMode.id
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <p className="font-medium text-gray-900">{paymentMode.name}</p>
                              <p className="text-gray-500">
                                {paymentMode.type === 1 ? 'UPI' :
                                 paymentMode.type === 2 ? 'Debit Card' :
                                 paymentMode.type === 3 ? 'Cheque' : 'Internet Banking'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <p className="text-gray-500 text-xs">No account selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          <textarea
            {...register('description', { required: 'Description is required' })}
            id="description"
            rows={3}
            placeholder="Enter transaction description"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tags <span className="text-sm font-normal text-gray-500">(Optional)</span>
          </h2>
          
          {/* Add New Tag */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a custom tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmedTag = newTag.trim();
                  if (trimmedTag && !watch('tags').includes(trimmedTag)) {
                    setValue('tags', [...watch('tags'), trimmedTag]);
                  }
                  setNewTag('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const trimmedTag = newTag.trim();
                if (trimmedTag && !watch('tags').includes(trimmedTag)) {
                  setValue('tags', [...watch('tags'), trimmedTag]);
                }
                setNewTag('');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Add
            </button>
          </div>

          {/* Selected Tags */}
          {watch('tags').length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Selected Tags</label>
              <div className="flex flex-wrap gap-2">
                {watch('tags').map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                  >
                    {tag}
                    <span className="ml-1 text-indigo-600">×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Suggested Tags</label>
            <div className="flex flex-wrap gap-2">
              {defaultTags
                .filter(tag => !watch('tags').includes(tag))
                .slice(0, 6)
                .map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {(createTransaction.error || updateTransaction.error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-sm text-red-600">
              Failed to save transaction. Please try again.
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isPending ? 'Saving...' : isEditing ? 'Update Transaction' : 'Create Transaction'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Modals */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onAmountChange={handleAmountChange}
        currentAmount={watchedValues.amount || 0}
      />

      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelect={(category) => setValue('categoryId', category.id)}
        selectedCategory={selectedCategory}
        title={`Select ${transactionTypes[activeTab].name} Category`}
      />

      <AccountSelectModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        onSelect={(account) => {
          setValue('accountId', account.id);
          setValue('paymentModeId', '');
        }}
        onPaymentModeSelect={(paymentModeId) => setValue('paymentModeId', paymentModeId)}
        selectedAccount={selectedAccount}
        selectedPaymentModeId={watchedValues.paymentModeId}
        title="Select Account"
        showPaymentModes={activeTab !== 2}
      />

      <AccountSelectModal
        isOpen={isFromAccountModalOpen}
        onClose={() => setIsFromAccountModalOpen(false)}
        accounts={accounts}
        onSelect={(account) => {
          setValue('accountId', account.id);
          setValue('fromPaymentModeId', '');
        }}
        onPaymentModeSelect={(paymentModeId) => setValue('fromPaymentModeId', paymentModeId)}
        selectedAccount={selectedAccount}
        selectedPaymentModeId={watchedValues.fromPaymentModeId}
        title="Select From Account"
        showPaymentModes={true}
      />

      <AccountSelectModal
        isOpen={isToAccountModalOpen}
        onClose={() => setIsToAccountModalOpen(false)}
        accounts={accounts}
        onSelect={(account) => {
          setValue('toAccountId', account.id);
          setValue('toPaymentModeId', '');
        }}
        onPaymentModeSelect={(paymentModeId) => setValue('toPaymentModeId', paymentModeId)}
        selectedAccount={selectedToAccount}
        selectedPaymentModeId={watchedValues.toPaymentModeId}
        title="Select Destination Account"
        excludeAccountId={watchedValues.accountId}
        showPaymentModes={true}
      />
    </div>
  );
}

export default TransactionForm;
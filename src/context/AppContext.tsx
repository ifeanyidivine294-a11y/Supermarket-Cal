import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  FirebaseUser,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  writeBatch,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '../firebase';
import {
  UserProfile,
  Product,
  CartItem,
  PricingMode,
  Sale,
  ProductSize,
  ProductColour,
  StoreSettings,
  DisplaySettings,
  OfficeRole,
} from '../types';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import confetti from 'canvas-confetti';

const ADMIN_EMAIL = 'chukwudebeifeanyi6@gmail.com';

interface AppContextType {
  // Auth & Roles
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  needsProfileCompletion: boolean;
  activePortal: 'sales' | 'admin' | 'settings' | 'history' | 'backup';
  setActivePortal: (portal: 'sales' | 'admin' | 'settings' | 'history' | 'backup') => void;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role: 'admin' | 'salesperson') => void;
  logout: () => Promise<void>;
  saveUserProfile: (data: { fullName: string; officeRole: OfficeRole | string; phone?: string; photoURL?: string }) => Promise<void>;

  // Products
  products: Product[];
  isProductsLoading: boolean;
  pricingMode: PricingMode;
  setPricingMode: (mode: PricingMode) => void;
  addProduct: (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (productId: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  resetToSampleInventory: () => Promise<void>;

  // Cart & POS Calculator
  cart: CartItem[];
  addToCart: (product: Product, size?: ProductSize, colour?: ProductColour, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  discountType: 'fixed' | 'percentage' | 'none';
  setDiscountType: (type: 'fixed' | 'percentage' | 'none') => void;
  discountValue: number;
  setDiscountValue: (val: number) => void;
  amountPaid: number;
  setAmountPaid: (val: number) => void;

  // Totals & Math
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  change: number;
  isPaymentValid: boolean;

  // Checkout
  isCheckingOut: boolean;
  checkoutError: string | null;
  lastSale: Sale | null;
  completeSale: () => Promise<Sale>;

  // Sales Monitoring (for Admin) & History (for Salesperson)
  sales: Sale[];
  isSalesLoading: boolean;

  // Settings & Display
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;
  displaySettings: DisplaySettings;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => Promise<void>;
  restoreDefaultDisplaySettings: () => Promise<void>;

  // Offline / Connectivity
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Trusted SupermarketCal',
  storeAddress: 'Asaba, Delta State, Nigeria',
  currency: '₦',
  defaultTheme: 'navy-green',
  lowStockThreshold: 10,
};

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  bgColor: '#F1F5FC',
  colorTheme: 'navy',
  appearance: 'light',
  density: 'comfortable',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [demoRole, setDemoRole] = useState<'admin' | 'salesperson' | null>(null);

  const [activePortal, setActivePortal] = useState<'sales' | 'admin' | 'settings' | 'history' | 'backup'>('sales');

  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [pricingMode, setPricingModeState] = useState<PricingMode>('retail');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage' | 'none'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const [sales, setSales] = useState<Sale[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState<boolean>(true);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check backend connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDemoRole(null);
        await loadOrCreateUserProfile(currentUser);
      } else if (!demoRole) {
        setProfile(null);
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [demoRole]);

  // Load or initialize user profile in Firestore
  const loadOrCreateUserProfile = async (fbUser: FirebaseUser) => {
    try {
      const isUserAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Enforce admin privileges if email matches ADMIN_EMAIL
        if (isUserAdmin && data.accountType !== 'admin') {
          await updateDoc(userDocRef, { accountType: 'admin' });
          data.accountType = 'admin';
        }
        setProfile(data);
        if (data.displaySettings) {
          setDisplaySettings(data.displaySettings);
        }
      } else {
        // Initial profile creation
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Staff Member',
          email: fbUser.email || '',
          officeRole: isUserAdmin ? 'Supermarket Owner & Administrator' : '',
          phone: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || '',
          accountType: isUserAdmin ? 'admin' : 'salesperson',
          active: true,
          displaySettings: DEFAULT_DISPLAY_SETTINGS,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      }

      // If user is admin, also create marker doc in admins collection for security rule lookup
      if (isUserAdmin) {
        try {
          await setDoc(doc(db, 'admins', fbUser.uid), {
            uid: fbUser.uid,
            email: fbUser.email,
            assignedAt: new Date().toISOString(),
          });
        } catch {
          // ignore if already exists or rule check passes
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Demo user mode for local testing without popups
  const loginAsDemoUser = (role: 'admin' | 'salesperson') => {
    setDemoRole(role);
    if (role === 'admin') {
      const adminProfile: UserProfile = {
        uid: 'demo_admin_uid_ifeanyi',
        fullName: 'Ifeanyi Chukwudebe (Owner)',
        email: ADMIN_EMAIL,
        officeRole: 'Supermarket Owner & Administrator',
        accountType: 'admin',
        active: true,
        displaySettings: DEFAULT_DISPLAY_SETTINGS,
        createdAt: new Date().toISOString(),
      };
      setProfile(adminProfile);
      setActivePortal('sales');
    } else {
      const staffProfile: UserProfile = {
        uid: 'demo_staff_uid_adaeze',
        fullName: 'Adaeze Okafor',
        email: 'adaeze.staff@trustedsupermarketcal.com',
        officeRole: 'Cashier',
        accountType: 'salesperson',
        active: true,
        displaySettings: DEFAULT_DISPLAY_SETTINGS,
        createdAt: new Date().toISOString(),
      };
      setProfile(staffProfile);
      setActivePortal('sales');
    }
    setIsAuthLoading(false);
  };

  const loginWithGoogle = async () => {
    try {
      setIsAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
      // If popup was blocked or failed, let user know or allow fallback
      alert('Google Sign-In popup could not complete. You can also click "Use Demo Staff/Admin Account" below to test seamlessly.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      await fbSignOut(auth);
    }
    setUser(null);
    setProfile(null);
    setDemoRole(null);
    setActivePortal('sales');
  };

  const saveUserProfile = async (data: {
    fullName: string;
    officeRole: OfficeRole | string;
    phone?: string;
    photoURL?: string;
  }) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      ...data,
    };
    setProfile(updated);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          fullName: data.fullName,
          officeRole: data.officeRole,
          phone: data.phone || '',
          photoURL: data.photoURL || '',
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  // Determine if the user is verified administrator
  const isAdmin = useMemo(() => {
    if (demoRole === 'admin') return true;
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
    if (profile?.accountType === 'admin') return true;
    return false;
  }, [user, profile, demoRole]);

  // Is profile completion required for salesperson?
  const needsProfileCompletion = useMemo(() => {
    if (!profile) return false;
    if (isAdmin) return false;
    // Salesperson must provide full name and office role
    return !profile.officeRole || profile.officeRole.trim() === '';
  }, [profile, isAdmin]);

  // Seed sample products if database is empty
  const seedInitialProductsIfEmpty = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        console.log('Seeding initial 40 Nigerian supermarket products...');
        const batch = writeBatch(db);
        SAMPLE_PRODUCTS.forEach((p) => {
          const ref = doc(db, 'products', p.productId);
          batch.set(ref, p);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Could not auto-seed sample products (offline or rules):', err);
      // Fallback: use memory sample products if Firestore is not populated yet
      if (products.length === 0) {
        setProducts(SAMPLE_PRODUCTS);
      }
    }
  };

  // Reset inventory to sample catalogue (Admin function)
  const resetToSampleInventory = async () => {
    if (!isAdmin) return;
    try {
      setIsProductsLoading(true);
      const batch = writeBatch(db);
      SAMPLE_PRODUCTS.forEach((p) => {
        const ref = doc(db, 'products', p.productId);
        batch.set(ref, p);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error resetting sample inventory:', err);
      // Local fallback
      setProducts(SAMPLE_PRODUCTS);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Real-time products listener
  useEffect(() => {
    setIsProductsLoading(true);
    const prodCol = collection(db, 'products');

    const unsubscribe = onSnapshot(
      prodCol,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed products
          seedInitialProductsIfEmpty();
          setProducts(SAMPLE_PRODUCTS);
        } else {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Product);
          });
          setProducts(list);
        }
        setIsProductsLoading(false);
      },
      (error) => {
        console.warn('Products onSnapshot error, using local fallback:', error.message);
        setProducts(SAMPLE_PRODUCTS);
        setIsProductsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time sales listener (Restricted: Admin sees all, Salesperson sees only theirs)
  useEffect(() => {
    if (!profile) {
      setSales([]);
      setIsSalesLoading(false);
      return;
    }

    setIsSalesLoading(true);
    let salesQuery = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));

    // If not admin, enforce query constraint where salespersonUid == user.uid
    if (!isAdmin && profile.uid) {
      salesQuery = query(
        collection(db, 'sales'),
        where('salespersonUid', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      salesQuery,
      (snapshot) => {
        const list: Sale[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Sale);
        });
        setSales(list);
        setIsSalesLoading(false);
      },
      (error) => {
        console.warn('Sales query error (possibly permissions):', error.message);
        setIsSalesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [profile?.uid, isAdmin]);

  // Product CRUD
  const addProduct = async (data: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProd: Product = {
      ...data,
      productId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'products', productId), newProd);
      setProducts((prev) => [newProd, ...prev]);
      return productId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${productId}`);
      return productId;
    }
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'products', productId), updatedData);
      setProducts((prev) => prev.map((p) => (p.productId === productId ? { ...p, ...updatedData } : p)));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  // Cart operations
  const setPricingMode = (newMode: PricingMode) => {
    setPricingModeState(newMode);
    // Instantly recalculate every item in the cart without clearing it!
    setCart((prevCart) =>
      prevCart.map((item) => {
        const targetProd = products.find((p) => p.productId === item.productId);
        let unitPrice = item.unitPrice;

        if (targetProd) {
          if (item.selectedSize) {
            const sizeObj = targetProd.sizes.find((s) => s.id === item.selectedSize?.id);
            if (sizeObj) {
              unitPrice = newMode === 'retail' ? sizeObj.retailPrice : sizeObj.smallBusinessPrice;
            }
          } else {
            unitPrice = newMode === 'retail' ? targetProd.retailPrice : targetProd.smallBusinessPrice;
          }
        }

        return {
          ...item,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        };
      })
    );
  };

  const addToCart = (product: Product, size?: ProductSize, colour?: ProductColour, quantity = 1) => {
    // Generate unique cart item ID based on product + variations
    const sizeId = size ? size.id : 'default';
    const colourId = colour ? colour.id : 'default';
    const cartItemId = `${product.productId}_${sizeId}_${colourId}`;

    let unitPrice = pricingMode === 'retail' ? product.retailPrice : product.smallBusinessPrice;
    if (size) {
      unitPrice = pricingMode === 'retail' ? size.retailPrice : size.smallBusinessPrice;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotal: unitPrice * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          productId: product.productId,
          name: product.name,
          category: product.category,
          imageURL: product.imageURL,
          pricingType: product.pricingType,
          selectedSize: size,
          selectedColour: colour,
          unitPrice,
          quantity,
          lineTotal: unitPrice * quantity,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQty,
            lineTotal: item.unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setDiscountType('none');
    setAmountPaid(0);
    setCheckoutError(null);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.lineTotal, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'none' || discountValue <= 0) return 0;
    if (discountType === 'percentage') {
      const pct = Math.min(100, Math.max(0, discountValue));
      return Math.round((subtotal * pct) / 100);
    }
    // Fixed Naira discount
    return Math.min(subtotal, Math.max(0, Math.round(discountValue)));
  }, [subtotal, discountType, discountValue]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const change = useMemo(() => {
    if (amountPaid <= 0) return 0;
    return Math.max(0, amountPaid - grandTotal);
  }, [amountPaid, grandTotal]);

  const isPaymentValid = useMemo(() => {
    if (grandTotal === 0) return true;
    return amountPaid >= grandTotal;
  }, [amountPaid, grandTotal]);

  // Complete Sale (Atomic Checkout with stock deduction)
  const completeSale = async (): Promise<Sale> => {
    if (cart.length === 0) {
      throw new Error('Cart is empty.');
    }
    if (!isPaymentValid) {
      throw new Error(`Insufficient payment. Grand total is ₦${grandTotal.toLocaleString()}, but ₦${amountPaid.toLocaleString()} was entered.`);
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    const saleId = `sale_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const dateNow = new Date();
    const dateStr = dateNow.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const receiptNumber = `TSC-${dateStr}-${randomSuffix}`;

    const saleData: Sale = {
      saleId,
      receiptNumber,
      salespersonUid: profile?.uid || user?.uid || 'staff_anonymous',
      salespersonName: profile?.fullName || 'Sales Cashier',
      salespersonRole: profile?.officeRole || 'Cashier',
      pricingMode,
      items: cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        sizeLabel: c.selectedSize?.label,
        colourName: c.selectedColour?.name,
        unitPrice: c.unitPrice,
        quantity: c.quantity,
        lineTotal: c.lineTotal,
        imageURL: c.imageURL,
      })),
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      grandTotal,
      amountPaid: amountPaid || grandTotal,
      change,
      createdAt: new Date().toISOString(),
    };

    try {
      // Execute atomic transaction for inventory deduction & sale creation
      await runTransaction(db, async (transaction) => {
        // Read all product docs to verify and deduct stock
        const productUpdates: { ref: any; updatedProduct: Product }[] = [];

        for (const cartItem of cart) {
          const productRef = doc(db, 'products', cartItem.productId);
          const prodDoc = await transaction.get(productRef);

          if (!prodDoc.exists()) {
            throw new Error(`Product "${cartItem.name}" no longer exists in catalogue.`);
          }

          const prodData = prodDoc.data() as Product;

          if (cartItem.selectedSize) {
            // Deduct size-specific stock
            const sizeIdx = prodData.sizes.findIndex((s) => s.id === cartItem.selectedSize?.id);
            if (sizeIdx >= 0) {
              if (prodData.sizes[sizeIdx].stockQuantity < cartItem.quantity) {
                throw new Error(`Insufficient stock for "${cartItem.name} (${cartItem.selectedSize.label})". Available: ${prodData.sizes[sizeIdx].stockQuantity}`);
              }
              prodData.sizes[sizeIdx].stockQuantity -= cartItem.quantity;
            }
          } else if (cartItem.selectedColour) {
            // Deduct colour-specific stock
            const colIdx = prodData.colours.findIndex((c) => c.id === cartItem.selectedColour?.id);
            if (colIdx >= 0) {
              if (prodData.colours[colIdx].stockQuantity < cartItem.quantity) {
                throw new Error(`Insufficient stock for "${cartItem.name} (${cartItem.selectedColour.name})". Available: ${prodData.colours[colIdx].stockQuantity}`);
              }
              prodData.colours[colIdx].stockQuantity -= cartItem.quantity;
            }
          }

          // Deduct overall stock quantity
          if (prodData.stockQuantity < cartItem.quantity) {
            throw new Error(`Insufficient stock for "${cartItem.name}". Available: ${prodData.stockQuantity}`);
          }
          prodData.stockQuantity -= cartItem.quantity;
          prodData.updatedAt = new Date().toISOString();

          productUpdates.push({ ref: productRef, updatedProduct: prodData });
        }

        // Apply all product stock updates
        for (const update of productUpdates) {
          transaction.set(update.ref, update.updatedProduct);
        }

        // Create sale record
        const saleRef = doc(db, 'sales', saleId);
        transaction.set(saleRef, saleData);
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#12A84A', '#1769E0', '#071B3A'],
        });
      } catch {
        // no-op if confetti fails
      }

      setLastSale(saleData);
      setSales((prev) => [saleData, ...prev]);
      clearCart();
      return saleData;
    } catch (err: any) {
      console.error('Checkout error:', err);
      // If Firestore transaction failed (e.g. offline fallback), record locally
      const errorMsg = err?.message || 'Failed to complete sale transaction.';
      setCheckoutError(errorMsg);

      // If user confirms offline recording
      setLastSale(saleData);
      setSales((prev) => [saleData, ...prev]);
      clearCart();
      return saleData;
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Settings
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...newSettings };
    setStoreSettings(updated);
    if (isAdmin) {
      try {
        await setDoc(doc(db, 'settings', 'general'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'settings/general');
      }
    }
  };

  const updateDisplaySettings = async (newDisplay: Partial<DisplaySettings>) => {
    const updated = { ...displaySettings, ...newDisplay };
    setDisplaySettings(updated);
    if (profile) {
      const updatedProfile = { ...profile, displaySettings: updated };
      setProfile(updatedProfile);
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { displaySettings: updated });
        } catch {
          // ignore
        }
      }
    }
  };

  const restoreDefaultDisplaySettings = async () => {
    setDisplaySettings(DEFAULT_DISPLAY_SETTINGS);
    if (profile) {
      const updatedProfile = { ...profile, displaySettings: DEFAULT_DISPLAY_SETTINGS };
      setProfile(updatedProfile);
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { displaySettings: DEFAULT_DISPLAY_SETTINGS });
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isAuthLoading,
        needsProfileCompletion,
        activePortal,
        setActivePortal,
        loginWithGoogle,
        loginAsDemoUser,
        logout,
        saveUserProfile,

        products,
        isProductsLoading,
        pricingMode,
        setPricingMode,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToSampleInventory,

        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        discountType,
        setDiscountType,
        discountValue,
        setDiscountValue,
        amountPaid,
        setAmountPaid,

        subtotal,
        discountAmount,
        grandTotal,
        change,
        isPaymentValid,

        isCheckingOut,
        checkoutError,
        lastSale,
        completeSale,

        sales,
        isSalesLoading,

        storeSettings,
        updateStoreSettings,
        displaySettings,
        updateDisplaySettings,
        restoreDefaultDisplaySettings,

        isOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

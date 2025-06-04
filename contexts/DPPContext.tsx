
"use client";

import React, { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { createProductAction, submitForVerificationAction, updateProductQRCodeAction, listProductsAction, type MockProduct as Product, type QRCodeData } from '@/app/actions/products';
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { functions as firebaseFunctionsInstance } from '@/lib/firebase'; // Corrected import path

// --- Type Definitions ---
export interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  companyId?: string;
}

// Use Product type from actions/products.ts
export type { Product, QRCodeData };


export interface DPPState {
  user: User | null;
  products: Product[];
  currentProduct: Product | null;
  // verifications: any[]; // Placeholder for verifications state
  loading: boolean;
  error: string | null;
}

type ActionType =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Partial<Product> & { id: string } } // Ensure id is present for updates
  | { type: 'SET_CURRENT_PRODUCT'; payload: Product | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// --- Initial State ---
const initialState: DPPState = {
  user: null,
  products: [],
  currentProduct: null,
  // verifications: [],
  loading: false,
  error: null,
};

// --- Reducer ---
const dppReducer = (state: DPPState, action: ActionType): DPPState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
        currentProduct:
          state.currentProduct?.id === action.payload.id
            ? { ...state.currentProduct, ...action.payload }
            : state.currentProduct,
      };
    case 'SET_CURRENT_PRODUCT':
      return { ...state, currentProduct: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// --- Context Definition ---
interface DPPContextType {
  state: DPPState;
  dispatch: Dispatch<ActionType>;
  actions: {
    setUser: (user: User | null) => void;
    fetchProducts: (companyId: string) => Promise<void>;
    createProduct: (productData: Omit<Product, 'id' | 'lastUpdated' | 'companyId' | 'dppStatus' | 'dppCompletion' | 'complianceStatus' | 'verificationLog'> & { manufacturingDate: Date }) => Promise<Product | undefined>;
    submitForVerification: (productId: string, userId: string /* verificationData: any */) => Promise<void>;
    generateQRForProduct: (productId: string, options?: { size?: string }) => Promise<QRCodeData | undefined>;
    setCurrentProductById: (productId: string | null) => void;
  };
}

const DPPContext = createContext<DPPContextType | undefined>(undefined);

// --- Provider Component ---
export const DPPProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(dppReducer, initialState);

  const actions = {
    setUser: (user: User | null) => {
      dispatch({ type: 'SET_USER', payload: user });
    },
    fetchProducts: async (companyId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await listProductsAction(companyId);
        if (result.success && result.data) {
          dispatch({ type: 'SET_PRODUCTS', payload: result.data });
        } else {
          dispatch({ type: 'SET_ERROR', payload: result.message || 'Failed to fetch products' });
        }
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'An unexpected error occurred' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    createProduct: async (productData: any /* Should match CreateProductFormValues from products.ts */) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Assume productData is compatible with CreateProductFormValues
        const result = await createProductAction(productData);
        if (result.success && result.data?.product) {
          dispatch({ type: 'ADD_PRODUCT', payload: result.data.product });
          return result.data.product;
        } else {
          dispatch({ type: 'SET_ERROR', payload: result.message || 'Failed to create product' });
          throw new Error(result.message || 'Failed to create product');
        }
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    submitForVerification: async (productId: string, userId: string /*, verificationData: any */) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await submitForVerificationAction(productId, userId /* Pass actual userId */);
        if (result.success) {
          dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, dppStatus: 'Pending Verification' } });
        } else {
           dispatch({ type: 'SET_ERROR', payload: result.message || 'Failed to submit for verification' });
           throw new Error(result.message || 'Failed to submit for verification');
        }
      } catch (error: any) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    generateQRForProduct: async (productId: string, options: { size?: string } = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const generateQRCallable = httpsCallable<{ productId: string; size?: string }, { qrCode: string; digitalLink: string; success: boolean }>(firebaseFunctionsInstance, 'generateQR');
        const result = await generateQRCallable({ productId, size: options.size });
        
        if (result.data.success) {
          const qrCodePayload: QRCodeData = {
            dataURL: result.data.qrCode,
            digitalLink: result.data.digitalLink,
            generatedAt: new Date().toISOString(),
          };
          // Update product in mock DB via server action
          await updateProductQRCodeAction(productId, qrCodePayload);
          // Update product in local state
          dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, qrCode: qrCodePayload } });
          return qrCodePayload;
        } else {
          throw new Error('QR code generation failed on server.');
        }
      } catch (error: any) {
        console.error("Error in generateQRForProduct action:", error);
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to generate QR code' });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    setCurrentProductById: (productId: string | null) => {
      if (!productId) {
        dispatch({ type: 'SET_CURRENT_PRODUCT', payload: null });
        return;
      }
      const product = state.products.find(p => p.id === productId);
      dispatch({ type: 'SET_CURRENT_PRODUCT', payload: product || null });
      if (!product) {
        // Optionally fetch if not found, though list should be pre-populated
        // dispatch({ type: 'SET_ERROR', payload: `Product with ID ${productId} not found in local state.` });
      }
    },
  };

  return (
    <DPPContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </DPPContext.Provider>
  );
};

// --- Custom Hook ---
export const useDPP = (): DPPContextType => {
  const context = useContext(DPPContext);
  if (!context) {
    throw new Error('useDPP must be used within a DPPProvider');
  }
  return context;
};

    
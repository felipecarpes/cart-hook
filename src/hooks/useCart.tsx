import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
	children: ReactNode;
}

interface UpdateProductAmount {
	productId: number;
	amount: number;
}

interface CartContextData {
	cart: Product[];
	addProduct: (productId: number) => Promise<void>;
	removeProduct: (productId: number) => void;
	updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
	const [cart, setCart] = useState<Product[]>(() => {
		const storagedCart = localStorage.getItem('@RocketShoes:cart');

		if (storagedCart) {
			return JSON.parse(storagedCart);
		}

		return [];
	});

	const addProduct = async (productId: number) => {
		try {
			if(cart.length > 0) {
				const productExists = cart.find(product => product.id === productId)

				const stock = await api.get<Stock>(`stock/${productId}`);

				const { amount } = stock.data

				if(productExists) {
					const newCart = cart.map(_product => {
						if(_product.id === productId) {
							if(_product.amount < amount) {
								_product.amount += 1
								toast.success('Produto adicionado com sucesso!');
							} else {
								toast.error('Produto atingiu limite de estoque');
							}
						}
						return _product
					});

					setCart(newCart);
					localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
				} else {
					const response = await api.get<Product>(`/products/${productId}`);

					const product = response.data;

					product.amount = 1

					setCart([...cart, product]);
					localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, product]));
					toast.success('Produto adicionado com sucesso!');
				}
			} else {
				const response = await api.get<Product>(`/products/${productId}`);

				const product = response.data;

				product.amount = 1

				setCart([...cart, product]);
				localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, product]));
				toast.success('Produto adicionado com sucesso!');
			}
		} catch {
			toast.error('Erro ao adicionar o produto no carrinho');
		}
	};

	const removeProduct = (productId: number) => {
		try {
		// TODO
		} catch {
			toast.error('Erro na remoção do produto');
		// TODO
		}
	};

	const updateProductAmount = async ({
		productId,
		amount,
	}: UpdateProductAmount) => {
		try {
	  // TODO
		} catch {
			toast.error('Quantidade solicitada fora de estoque');
		// TODO
		}
	};

	return (
		<CartContext.Provider
			value={{ cart, addProduct, removeProduct, updateProductAmount }}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartContextData {
	const context = useContext(CartContext);

	return context;
}

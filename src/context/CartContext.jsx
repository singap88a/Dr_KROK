import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem("drkrok_cart");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to load cart from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("drkrok_cart", JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cartItems]);

    // item shape: { id, type (book | course | live_course), name, image, price, url }
    const addToCart = (item) => {
        const existingItem = cartItems.find(
            (i) => String(i.id) === String(item.id) && i.type === item.type
        );

        if (existingItem) {
            toast.info(t("cart.already_in_cart", "Item is already in the cart!"), { position: "top-right" });
            return;
        }

        const newItems = [...cartItems, item];
        setCartItems(newItems);
        localStorage.setItem("drkrok_cart", JSON.stringify(newItems));
        toast.success(t("cart.added_to_cart", "Added to the cart successfully!"), { position: "top-right" });
    };

    const removeFromCart = (itemId, itemType) => {
        const newItems = cartItems.filter((i) => !(String(i.id) === String(itemId) && i.type === itemType));
        setCartItems(newItems);
        localStorage.setItem("drkrok_cart", JSON.stringify(newItems));
        toast.info(t("cart.removed_from_cart", "Item removed from the cart."), { position: "top-right" });
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("drkrok_cart");
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: 'TshimologoTone',
            cartId: '',
            cartTotal: 0.00,
            cartPizzas: [],
            paymentAmount: 0.00,
            message: '',
            Login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else {
                alert("username is too short")
                }
            },
            Logout() {
                if (confirm('Do you want to logout')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['username'] = '';
                }
            },
            createCart() {
                if (!this.username) {
                    // this.cartId = 'No username to create a cart for'
                    return Promise.resolve();
                }

                const cartId = localStorage.getItem('cartId');

                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage.setItem('cartId', this.cartId);
                        });
                }
            },
            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
                return axios.get(getCartURL);
            },
            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    cart_code: this.cartId,
                    pizza_id: pizzaId
                });
            },
            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    cart_code: this.cartId,
                    pizza_id: pizzaId
                });
            },
            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    cart_code: this.cartId,
                    amount: amount
                });
            },
            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                }).catch(error => {
                    console.error("Error fetching cart data:", error);
                });
            },
            init() {
                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername;
                }

                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
                    }).catch(error => {
                        console.error("Error fetching pizzas:", error);
                    });

                this.createCart()
                    .then(() => {
                        this.showCartData();
                    }).catch(error => {
                        console.error("Error creating cart:", error);
                    });
            },
            addPizzaToCart(pizzaId) {
                this.addPizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    }).catch(error => {
                        console.error("Error adding pizza to cart:", error);
                    });
            },
            removePizzaFromCart(pizzaId) {
                this.removePizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    }).catch(error => {
                        console.error("Error removing pizza from cart:", error);
                    });
            },
            payForCart() {
                this.pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status === 'failure') {
                            this.message = result.data.message;
                        } else {
                            this.message = 'Payment received!';
                            this.cartPizzas = [];
                            this.cartTotal = 0.00;
                            localStorage.removeItem('cartId');
                        }
                        setTimeout(() => {
                            this.message = '';
                            this.createCart();
                            this.paymentAmount = 0;
                        }, 3000);
                    }).catch(error => {
                        console.error("Error processing payment:", error);
                    });
            }
        };
    });
});

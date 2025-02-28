import './App.scss';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Dashboard from './components/Dashboard';
import {useAuth} from "react-oidc-context";
import {signOutRedirect} from "./api";

function App() {
    const auth = useAuth();

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
            <>
                <div className="App">
                    <BrowserRouter>
                        <Routes>
                            <Route index element={<Dashboard auth={auth}/>}/>
                        </Routes>
                    </BrowserRouter>
                </div>
            </>
        );
    } else {

    return (
        <div>
            <button onClick={() => auth.signinRedirect()}>Sign in</button>
            <button onClick={() => signOutRedirect()}>Sign out</button>
        </div>
    );
}


}

export default App;

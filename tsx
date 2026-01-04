        {isAuthenticated && user && (
            <>
                <DropdownMenuLabel className=\"font-normal\">
                    <div className=\"flex flex-col space-y-1\">
                        <p className=\"text-sm font-medium leading-none\">{user.name}</p>
                        <p className=\"text-xs leading-none text-muted-foreground\">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
            </>
        )}

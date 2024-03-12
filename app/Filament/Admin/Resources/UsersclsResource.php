<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\UsersclsResource\Pages;
use App\Filament\Admin\Resources\UsersclsResource\RelationManagers;
use App\Models\Userscls;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UsersclsResource extends Resource
{
    protected static ?string $model = Userscls::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                //
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserscls::route('/'),
            'create' => Pages\CreateUserscls::route('/create'),
            'edit' => Pages\EditUserscls::route('/{record}/edit'),
        ];
    }
}
